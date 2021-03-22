import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {GlobusService} from '../globus.service';
import {TransferData} from '../upload/upload.component';
import {SelFilesType} from '../navigate-template/navigate-template.component';
import {catchError, flatMap} from 'rxjs/operators';
import {forkJoin, of, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {Stack} from '../stack';
import {NavigateDirectoriesComponent} from '../navigate-directories/navigate-directories.component';
import {SelectDirectoryComponent} from '../select-directory/select-directory.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {PassingDataType} from '../search-endpoint/search-endpoint.component';

export interface PassingDataSelectType {
  dataTransfer: TransferData;
  selectedEndPoint: any;
  selectedDirectory: string;
}

@Component({
  selector: 'app-navigate-template-download',
  templateUrl: './navigate-template-download.component.html',
  styleUrls: ['./navigate-template-download.component.css']
})
export class NavigateTemplateDownloadComponent implements OnInit, OnChanges {

  constructor(private globusService: GlobusService,
              public dialog: MatDialog,
              public snackBar: MatSnackBar) {
  }

  @Input() transferData: TransferData;
  @Input() selectedEndPoint: any;

  public dialogRef: MatDialogRef<SelectDirectoryComponent>;
  selectedDirectory: string;
  files: Array<string>;
  paths: Array<object>;
  levels: Stack<object>;

  loaded: boolean;
  tree: any;

  checkFlag: boolean;
  personalDirectories: any;
  selectedOptions: any;
  selectedFiles: Array<object>;
  isSingleClick: boolean;
  storageIdentifiers: Array<string>;
  listOfAllFiles: Array<object>;
  listOfAllPaths: Array<string>;
  taskId: string;



  ngOnInit(): void {
    this.startComponent();
  }

  ngOnChanges() {
    this.startComponent();
  }

  startComponent() {
    console.log(this.transferData);
    this.selectedFiles = new Array<object>();
    this.loaded = false;
    if (this.selectedEndPoint.default_directory == null) {
      this.selectedDirectory = '~/';
    } else {
      this.selectedDirectory = this.selectedEndPoint.default_directory;
    }
    if (typeof this.transferData.userAccessTokenData !== 'undefined' && typeof this.transferData.globusEndpoint !== 'undefined') {
      this.findDirectories()
          .subscribe(
              data => this.processDirectories(data),
              error => {
                console.log(error);
                //this.load = true;
              },
              () => {
                this.loaded = true;
              }
          );
    }
  }

  findDirectories() {
    const url = this.transferData.siteUrl + '/api/datasets/' + this.transferData.datasetId + '/versions/' +
        this.transferData.datasetVersion + '/files';
    console.log(url);
    return this.globusService
        .getDataverse(url, this.transferData.key);
  }

  processDirectories(data) {
    console.log(data.data);
    this.files = new Array<string>();
    this.paths = new Array<object>();
    this.storageIdentifiers = new Array<string> ();
    for (const obj of data.data) {
      if (typeof obj.directoryLabel !== 'undefined') {
        const fullFile = obj.directoryLabel + '/' + obj.label;
        this.files.push(fullFile);
        this.paths.push(fullFile.split('/'));
      } else {
        this.files.push(obj.label);
        this.paths.push(obj.label.split('/'));
      }
      console.log(obj.dataFile.storageIdentifier);
      console.log(obj.dataFile.storageIdentifier.split(':')[2]);
      this.storageIdentifiers.push(obj.dataFile.storageIdentifier.split(':')[2]);
    }
    console.log(this.files);
    console.log(this.paths);
    this.personalDirectories = this.arrangeIntoTree(this.paths);
    this.tree = this.personalDirectories;
    console.log(JSON.stringify(this.personalDirectories, null, 4));
    this.levels = new Stack<object>();
    this.selectedOptions = new Array<object>();

  }

  arrangeIntoTree(paths) {
    const tree = [];

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      let currentLevel = tree;
      const storageId = this.storageIdentifiers[i];
      for (let j = 0; j < path.length; j++) {
        const part = path[j];

        const existingPath = this.findWhere(currentLevel, 'name', part);

        if (existingPath) {
          currentLevel = existingPath.children;
        } else {
          const newPart = {
            name: part,
            storageIdentifier: storageId,
            children: [],
          };

          currentLevel.push(newPart);
          currentLevel = newPart.children;
        }
      }
    }
    return tree;
  }

  findWhere(array, key, value) {
    let t = 0; // t is used as a counter
    while (t < array.length && array[t][key] !== value) {
      t++;
    }
    if (t < array.length) {
      return array[t];
    } else {
      return false;
    }
  }

  selectAll($event, directory) {
    this.checkFlag = false;
    if ($event.checked) {
      for (const obj of this.personalDirectories) {
        this.selectedOptions.push(obj);

       // const file: SelFilesType = {fileNameObject: obj, directory: this.selectedDirectory };
        console.log(obj);
        console.log(this.selectedFiles);
        const indx = this.selectedFiles.findIndex(x =>
            x['name'] === obj.name        );
        console.log(indx);
        if ( indx === -1) {
          this.selectedFiles.push(obj);
        }
      }
      this.checkFlag = true;
      directory.writeValue(this.personalDirectories);
    } else {
      this.checkFlag = false;
     /* for (const obj of this.personalDirectories) {
        const indx = this.selectedFiles.indexOf(obj);
        if (indx !== -1) {
          this.selectedFiles.splice(indx, 1);
        }
      }*/
      this.selectedOptions = new Array<object>();
      directory.writeValue(this.selectedOptions);
    }
  }

  onSelection($event, selectedFiles) {
    this.isSingleClick = true;
    console.log($event.option._value);
    setTimeout(() => {
      if (this.isSingleClick ){

        // const file: SelFilesType = {fileNameObject: $event.option._value, directory: this.selectedDirectory };
        if ($event.option._selected) {
          console.log(this.selectedFiles);
          const indx = this.selectedFiles.findIndex(x =>
              x['name'] === $event.option._value.name
          );
          console.log(indx);
          if ( indx === -1) {
            this.selectedFiles.push($event.option._value);
          }
        } else {
          /*const indx = this.selectedFiles.indexOf($event.option._value);
          if ( indx !== -1) {
            this.selectedFiles.splice(indx, 1);
          }*/
          this.checkFlag = false;
        }
      }
    }, 250);
  }

  checkBox($event, item) {
    if (!$event.checked) {
      this.checkFlag = false;
    }
  }

  removeAllFromSelected(directory) {
    this.selectedFiles = new Array<object>();
    directory.writeValue(null);
    this.selectedOptions = new Array();
    this.checkFlag = false;
  }

  onRemoving($event, selectedList) {
    if ($event.option._selected) {
      const indx = this.selectedFiles.indexOf($event.option._value);
      if ( indx !== -1) {
        this.selectedFiles.splice(indx, 1);
        const indx2 = this.selectedOptions.indexOf($event.option._value.name);
        if (indx2 !== -1) {
          this.selectedOptions.splice(indx2, 1);
          selectedList.writeValue(this.selectedOptions);
          this.checkFlag = false;
        }
      }
    }
  }

  isFolder(file) {
    if (file.children.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  UpOneFolder() {
    const up = this.levels.pop();
    console.log(up);
    if (typeof up !== 'undefined') {
      this.personalDirectories = up;
      this.checkFlag = false;
    }
  }

  openDirectory($event, item, directory, check) {
    this.isSingleClick = false;
    this.selectedOptions = new Array<object>();
    console.log(directory);
    this.selectedOptions = new Array<object>();
    if (item.children.length > 0) {
      this.levels.push(this.personalDirectories);
      // this.selectedDirectory = this.selectedDirectory + item.name;
      this.selectedOptions = new Array<object>();
      this.personalDirectories = item.children;
      directory.writeValue(this.selectedOptions);
      check.checked = false;
    }
  }
  findChildren(array, path) {
    console.log(array);
    for (const obj of array ) {
      if (obj.children.length === 0) {
        console.log(obj);
        this.listOfAllFiles.push(obj);
        this.listOfAllPaths.push(path);
      } else {
        this.findChildren(obj.children, path + obj.name + '/');
      }
    }
  }
  onSubmitTransfer() {
    this.listOfAllFiles = new Array<object>();
    this.listOfAllPaths = new Array<string>();
    this.findChildren(this.selectedFiles, '');

    this.globusService.submitTransfer(this.transferData.userAccessTokenData.other_tokens[0].access_token)
    .pipe( flatMap(data => this.globusService.submitTransferToUser(
        this.listOfAllFiles, this.listOfAllPaths, data['value'], this.transferData.datasetDirectory,
        this.selectedDirectory, this.transferData.globusEndpoint, this.selectedEndPoint, this.transferData.userAccessTokenData.other_tokens[0].access_token)))        .subscribe(
            data => {
              console.log(data);
              this.taskId = data['task_id'];
            },
            error => {
              console.log(error);
              this.snackBar.open('There was an error in transfer submission. BIIG ', '', {
                duration: 3000
              });
            },
            () => {
              console.log('Transfer submitted');

            }
        );
  }

  preparedForTransfer() {
    if (this.selectedFiles.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  selectDirectory() {
    const passingData: PassingDataSelectType = {
      dataTransfer: this.transferData,
      selectedEndPoint: this.selectedEndPoint,
      selectedDirectory: this.selectedDirectory
    };

    this.dialogRef = this.dialog.open(SelectDirectoryComponent, {
      data: passingData,
      //panelClass: 'field_width',
      width: '400px'
    });

    const sub = this.dialogRef.componentInstance.updateSelectedDirectoryEvent.subscribe((x) => {
      this.selectedDirectory = x;
      console.log(x);
    });
    // this.dialogRef.afterClosed().subscribe(() => {
      // unsubscribe onAdd
    // });
  }
  setDirectory(directory) {
    this.selectedDirectory = directory;
  }



}
