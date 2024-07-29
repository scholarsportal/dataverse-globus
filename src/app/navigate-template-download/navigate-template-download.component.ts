import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {GlobusService} from '../globus.service';
import {TransferData} from '../upload/upload.component';
import {catchError, flatMap} from 'rxjs/operators';
import {forkJoin, of, throwError} from 'rxjs';
import {Stack} from '../stack';
import {SelectDirectoryComponent} from '../select-directory/select-directory.component';
import {ConfigService} from '../config.service';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatListModule} from '@angular/material/list';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {MatInput} from '@angular/material/input';
import {CdkFixedSizeVirtualScroll, CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {SelFilesType} from '../navigate-template/navigate-template.component';
import { CustomSnackbarComponent } from '../custom-snackbar/custom-snackbar.component';

export interface PassingDataSelectType {
  dataTransfer: TransferData;
  selectedEndPoint: any;
  selectedDirectory: string;
}

@Component({
  selector: 'app-navigate-template-download',
  standalone: true,
    imports: [
        TranslateModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatSelectModule,
        NgIf,
        ReactiveFormsModule,
        NgForOf,
        MatGridListModule,
        MatIconModule,
        MatCheckboxModule,
        MatListModule,
        FormsModule,
        MatInput,
        CdkFixedSizeVirtualScroll,
        CdkVirtualScrollViewport
    ],
  templateUrl: './navigate-template-download.component.html',
  styleUrls: ['./navigate-template-download.component.css']
})
export class NavigateTemplateDownloadComponent implements OnInit, OnChanges {

  constructor(private globusService: GlobusService,
              public dialog: MatDialog,
              public snackBar: MatSnackBar,
              private configService: ConfigService) {
  }

  @Input() transferData: TransferData;
  @Input() selectedEndPoint: any;
  @Input() type: number;

  public dialogRef: MatDialogRef<SelectDirectoryComponent>;
  selectedDirectory: string;
  files: Array<string>;
  paths: Array<object>;
  levels: Stack<object>;
  levelsDownloadTo: Stack<object>;
  allDataFiles: Array<any>;

  loaded: boolean;
  tree: any;

  checkFlag: boolean;
  personalDirectories: any;
  downloadToDirectories: any;
  selectedOptions: any;
  selectedFiles: Array<object>;
  isSingleClick: boolean;
  storageIdentifiers: Array<string>;
  listOfAllFiles: Array<object>;
  listOfAllPaths: Array<string>;
  taskId: string;
  ruleId: string;
  clientToken: any;
  accessEndpointFlag: boolean;




  ngOnInit(): void {
    if (this.selectedEndPoint.default_directory == null) {
      this.selectedDirectory = '/~/';
    } else {
      this.selectedDirectory = this.selectedEndPoint.default_directory;
    }
    // Not needed - ngOnChanges is called prior to ngOnInit
    // this.startComponent();
  }

  ngOnChanges() {
    this.startComponent();
  }

  startComponent() {
    this.ruleId = null;
    this.clientToken = null;
    this.selectedFiles = new Array<object>();
    this.loaded = false;
    this.accessEndpointFlag = false;
    if (this.selectedEndPoint.default_directory == null) {
      this.selectedDirectory = '~/';
    } else {
      this.selectedDirectory = this.selectedEndPoint.default_directory;
    }

    if (typeof this.transferData.userAccessTokenData !== 'undefined' &&
        (typeof this.transferData.globusEndpoint !== 'undefined' || !this.transferData.managed)) {

      this.findDirectories()
          .subscribe(
              data => this.processDirectories(data),
              error => {
                console.log(error);
                this.loaded = true;
              },
              () => {
                this.getDownloadingToDirectories()
                    .subscribe(
                        data => this.processDirectoriesToDownload(data),
                        error => {
                          console.log(error);
                          this.loaded = true;
                        },
                        () => {
                          this.accessEndpointFlag = true;
                          this.loaded = true;
                        }
                    );
              }
          );
    }
  }
  processDirectoriesToDownload(data) {
    this.downloadToDirectories = new Array<object>();
    this.selectedDirectory = data.path;
    for (const obj of data.DATA) {
      if (obj.type === 'dir') {
        this.downloadToDirectories.push(obj);
      }
    }
    this.levelsDownloadTo = new Stack<object>();
  }

  getDownloadingToDirectories() {
    const url = 'https://transfer.api.globusonline.org/v0.10/operation/endpoint/' + this.selectedEndPoint.id + '/ls' + '?path=' +
        this.selectedDirectory;
    return this.globusService
        .getGlobus(url, 'Bearer ' + this.transferData.userAccessTokenData.other_tokens[0].access_token);
  }

  findDirectories() {
    let urlPath = '';
    if (this.type !== 2) {
      for (const urlObject of this.transferData.signedUrls) {
        if (urlObject['name'] === 'getFileListing') {
          urlPath = urlObject['signedUrl'];
          break;
        }
      }
      return this.globusService.getDataverse(urlPath);
    } else {
      return of();
    }
  }
  processDirectories(data) {
    if (this.type !== 2) {
      this.files = new Array<string>();
      this.paths = new Array<object>();
      this.storageIdentifiers = new Array<string>();
      this.allDataFiles = new Array<any>();
      for (const obj of data.data) {
        for (const f in this.transferData.files) {
          if (obj.dataFile.id == f) {
            if (typeof obj.directoryLabel !== 'undefined') {
              const fullFile = obj.directoryLabel + '/' + obj.label;
              this.files.push(fullFile);
              this.paths.push(fullFile.split('/'));
            } else {
              this.files.push(obj.label);
              this.paths.push(obj.label.split('/'));
            }

            if (this.transferData.managed) {
              // this.storageIdentifiers.push(obj.dataFile.storageIdentifier.split(':')[2]);
              this.storageIdentifiers.push(obj.dataFile.storageIdentifier.split(':').pop());
            } else {
              const ind =  this.transferData.files[f].indexOf('/');
              this.transferData.globusEndpoint = this.transferData.files[f].substring(0, ind);

              let temp = obj.dataFile.storageIdentifier.split('//').pop();
              const index = temp.indexOf('/');

              temp = temp.substring(index);
              this.storageIdentifiers.push(temp);
            }
            this.allDataFiles.push(obj.dataFile);
          }
        }
      }
      this.personalDirectories = this.arrangeIntoTree(this.paths);
      this.tree = this.personalDirectories;
      this.levels = new Stack<object>();
      this.selectedOptions = new Array<object>();
    }
  }

  arrangeIntoTree(paths) {
    const tree = [];

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      let currentLevel = tree;
      const storageId = this.storageIdentifiers[i];
      const fileId = this.allDataFiles[i].id;
      for (let j = 0; j < path.length; j++) {
        const part = path[j];

        const existingPath = this.findWhere(currentLevel, 'name', part);

        if (existingPath) {
          currentLevel = existingPath.children;
        } else {
          const newPart = {
            name: part,
            storageIdentifier: storageId,
            fId: fileId,
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
        const indx = this.selectedFiles.findIndex(x =>
            x['name'] === obj.name        );
        if ( indx === -1) {
          this.selectedFiles.push(obj);
        }
      }
      this.checkFlag = true;
      directory.writeValue(this.personalDirectories);
    } else {
      this.checkFlag = false;
      for (const obj of this.personalDirectories) {

        const indx = this.selectedFiles.findIndex(x =>
            x['name'] === obj['name']
        );
        if (indx !== -1) {
          this.selectedFiles.splice(indx, 1);
        }
      }

      this.selectedOptions = new Array<object>();
      directory.writeValue(this.selectedOptions);
    }
  }

  onSelection($event) {
    this.isSingleClick = true;
    setTimeout(() => {
      if (this.isSingleClick ){
        if ($event.options[0]._selected) {
          const indx = this.selectedFiles.indexOf($event.options[0]._value);
          if ( indx === -1) {
            this.selectedFiles.push($event.options[0]._value);
            this.selectedOptions.push($event.options[0]._value)
          }
        } else {
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
    if ($event[0]._selected) {
      const indx = this.selectedFiles.indexOf($event[0]._value);
      if ( indx !== -1) {
        this.selectedFiles.splice(indx, 1);
        const indx2 = this.selectedOptions.indexOf($event[0]._value);
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
    if (typeof up !== 'undefined') {
      this.personalDirectories = up;
      this.checkFlag = false;
    }
  }
  UpOneFolderDownloadTo() {
    if (this.selectedDirectory === '/~/' ) {
      return;
    }
    this.globusService.getDirectory(this.selectedDirectory,
        this.selectedEndPoint.id,
        this.transferData.userAccessTokenData.other_tokens[0].access_token)
        .pipe(flatMap(data => this.upFolderProcess(data)))
        .subscribe(
            data => {
              if (data !== null) {
                this.processDirectoriesToDownload(data);
              }
            },
            error => {
              console.log(error);
            },
            () => {
            }
        );
  }
  upFolderProcess(data) {
    let absolutePath = data['path'];
    if (data.absolute_path == null || data.absolute_path === 'null') {
      absolutePath = data.absolute_path;
    }
    if (absolutePath !== null && absolutePath.localeCompare('/') !== 0) {
      const temp = absolutePath.substr(0, absolutePath.lastIndexOf('/') - 1);
      const path = temp.substr(0, temp.lastIndexOf('/')) + '/';
      return this.globusService.getDirectory(path,
          this.selectedEndPoint.id,
          this.transferData.userAccessTokenData.other_tokens[0].access_token);
    } else {
      return of(null);
    }
  }
  openDirectoryDownload($event, item) {
    this.selectedDirectory = this.selectedDirectory + item.name + '/';
    this.getDownloadingToDirectories()
        .subscribe(
            data => this.processDirectoriesToDownload(data),
            error => {
              console.log(error);
            },
            () => {
            }
        );
  }

  openDirectory($event, item, directory, check) {
    this.isSingleClick = false;
    this.selectedOptions = new Array<object>();
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
    for (const obj of array ) {
      if (obj.children.length === 0) {
        this.listOfAllFiles.push(obj);
        this.listOfAllPaths.push(path);
      } else {
        this.findChildren(obj.children, path + obj.name + '/');
      }
    }
  }
  askRequestDownload(data) {
    const user = data[0];
    let json_data = '{ ' +
        '"principal":"' + user['sub'] + '",' +
        '"fileIds":[';
    let i = 0;
    for (const f of this.selectedFiles) {
      if (i > 0) {
        json_data = json_data + ',';
      }
      json_data = json_data + f['fId'];
      i++;
    }
    json_data = json_data + ']}';
    // curl -H "X-Dataverse-key:$API_TOKEN" -H "Content-type:application/json" -X POST -d "$JSON_DATA" "$SERVER_URL/api/datasets/:persistentId/requestGlobusDownload?persistentId=$PERSISTENT_IDENTIFIER"
    let urlPath = null;
    for (const urlObject of this.transferData.signedUrls) {
      if (/*this.transferData.managed &&*/ urlObject['name'] === 'requestGlobusDownload') {
        urlPath = urlObject['signedUrl'];
        break;
      }
    }
    return this.globusService.postSimpleDataverse(urlPath, json_data);
  }

  onSubmitTransfer() {
    this.listOfAllFiles = new Array<object>();
    this.listOfAllPaths = new Array<string>();
    this.findChildren(this.selectedFiles, '');

    if (this.listOfAllFiles.length > 0) {
      const user = this.globusService.getUserInfo(this.transferData.userAccessTokenData.access_token);

      // const client = this.globusService.getClientToken(this.transferData.basicClientToken);

      const array = [user]; // forkJoin;
      let sourceDatasetDirectory = '';
      if (this.transferData.managed) {
        sourceDatasetDirectory = this.transferData.datasetDirectory;
      }
      forkJoin(array)
          .pipe(flatMap(data => this.askRequestDownload(data)))
          .pipe(flatMap(data => {
            return this.globusService.submitTransfer(this.transferData.userAccessTokenData.other_tokens[0].access_token);
          } ))
          .pipe(flatMap(data => this.globusService.submitTransferToUser(
              this.listOfAllFiles, this.listOfAllPaths, data['value'], sourceDatasetDirectory,
              this.selectedDirectory, this.transferData.globusEndpoint, this.selectedEndPoint,
              this.transferData.userAccessTokenData.other_tokens[0].access_token)))
          .subscribe(
              data => {
                this.taskId = data['task_id'];
                if (this.transferData.managed) {
                  this.writeToDataverse(this.taskId);
                }
              },
              error => {
                console.log(error);
                this.snackBar.open('There was an error in transfer submission. BIIG ', '', {
                  duration: 3000
                });
              },
              () => {
                console.log('Transfer submitted');

                let snackBarRef = this.snackBar.open('The transfer was submitted', '', {
                  duration: 3000
                });

                snackBarRef.afterDismissed().subscribe(() => {
                  this.snackBar.openFromComponent(CustomSnackbarComponent, {
                    data: ['Large transfers may take significant time. You can check transfer status at',
                    'https://app.globus.org/activity'],
                    duration: 5000
                  });
                });

              }
          );
    }
  }

  writeToDataverse(task_id) {
    let json_data = '{ ' +
        '"taskIdentifier":"' + task_id + '"';
    json_data = json_data + '}';
    let urlPath = null;
    for (const urlObject of this.transferData.signedUrls) {
      if (this.transferData.managed && urlObject['name'] === 'monitorGlobusDownload') {
        urlPath = urlObject['signedUrl'];
        break;
      }
    }
    this.globusService.postSimpleDataverse(urlPath, json_data)
        .subscribe(
            data => {
            },
            error => {
              console.log(error);

              this.snackBar.open('There was an error in transfer submission. ', '', {
                duration: 3000
              });
            },
            () => {
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
      width: '400px'
    });

    const sub = this.dialogRef.componentInstance.updateSelectedDirectoryEvent.subscribe((x) => {
      this.selectedDirectory = x;
    });
  }
  setDirectory(directory) {
    this.selectedDirectory = directory;
  }
  searchDirectory(directory) {
    this.selectedDirectory = directory;
    this.globusService.getDirectory(this.selectedDirectory,
        this.selectedEndPoint.id,
        this.transferData.userAccessTokenData.other_tokens[0].access_token)
        .subscribe(
            data => {
              this.processDirectoriesToDownload(data);
            },
            error => {
              console.log(error);
            },
            () => {
            }
        );
  }
}
