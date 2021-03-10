import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {GlobusService} from '../globus.service';
import {TransferData} from '../upload/upload.component';
import {SelFilesType} from '../navigate-template/navigate-template.component';
import {catchError, flatMap} from 'rxjs/operators';
import {forkJoin, of, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-navigate-template-download',
  templateUrl: './navigate-template-download.component.html',
  styleUrls: ['./navigate-template-download.component.css']
})
export class NavigateTemplateDownloadComponent implements OnInit, OnChanges {

  constructor(private globusService: GlobusService,
              public snackBar: MatSnackBar) { }

  @Input() transferData: TransferData;
  @Input() selectedEndPoint: any;

  checkFlag: boolean;
  personalDirectories: any;
  selectedOptions: any;
  selectedFiles: Array<SelFilesType>;
  selectedDirectory: any;
  isSingleClick: boolean;
  listOfAllFiles: Array<string>;
  listOfFileNames: Array<string>;
  listOfAllStorageIdentifiers: Array<string>;
  listOfDirectoryLabels: Array<string>;
  taskId: string;
  accessEndpointFlag: boolean;
  load: boolean;

  ngOnInit(): void {
    this.startComponent();
  }

  ngOnChanges() {
    this.startComponent();
  }

  startComponent() {
    this.load = false;
    console.log(this.selectedEndPoint);
    this.accessEndpointFlag = false;
    this.selectedFiles = new Array<SelFilesType>();
    this.checkFlag = false;
    this.isSingleClick = true;
    this.listOfAllFiles = new Array<string>();
    this.listOfFileNames = new Array<string>();
    this.listOfDirectoryLabels = new Array<string>();
    this.listOfAllStorageIdentifiers = new Array<string>();
    if (typeof this.transferData.userAccessTokenData !== 'undefined' && typeof this.transferData.globusEndpoint !== 'undefined') {
      // this.userOtherAccessToken = this.userAccessTokenData.other_tokens[0].access_token;
      // this.userAccessToken = this.userAccessTokenData.access_token;
      this.findDirectories()
          .subscribe(
              data => this.processDirectories(data),
              error => {
                console.log(error);
                this.load = true;
              },
              () => {
                console.log(this.checkFlag);
                this.accessEndpointFlag = true;
                this.load = true;
              }
          );
    }
  }

  findDirectories() {
    if (this.selectedEndPoint.default_directory == null) {
      this.selectedDirectory = '~/';
    } else {
      this.selectedDirectory = this.selectedEndPoint.default_directory;
    }
    const url = this.transferData.siteUrl + '/api/datasets/' +
        this.transferData.datasetId + '/versions/' +
        this.transferData.datasetVersion + '/files';
    return this.globusService
        .getDataverse(url, this.transferData.key);

  }

  searchDirectory(directory) {
    this.checkFlag = false;
    this.selectedDirectory = directory;
    this.globusService.getDirectory(this.selectedDirectory,
        this.selectedEndPoint.id,
        this.transferData.userAccessTokenData.other_tokens[0].access_token)
        .subscribe(
            data => {
              console.log(data);
              this.processDirectories(data);
            },
            error => {
              console.log(error);
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

  selectAll($event, directory) {
    this.checkFlag = false;
    if ($event.checked) {
      for (const obj of this.personalDirectories) {
        this.selectedOptions.push(obj);

        const file: SelFilesType = {fileNameObject: obj, directory: this.selectedDirectory };
        console.log(file);
        console.log(this.selectedFiles);
        const indx = this.selectedFiles.findIndex(x =>
            x.fileNameObject === file.fileNameObject &&
            x.directory === file.directory
        );
        console.log(indx);
        if ( indx === -1) {
          this.selectedFiles.push(file);
        }
        // const file: SelFilesType = {fileNameObject: obj, directory: this.selectedDirectory };
        // this.selectedFiles.push(file);
      }
      this.checkFlag = true;
      directory.writeValue(this.personalDirectories);
    } else {
      this.checkFlag = false;
      for (const obj of this.personalDirectories) {

        const file: SelFilesType = {fileNameObject: obj, directory: this.selectedDirectory };
        const indx = this.selectedFiles.indexOf(file);
        if (indx !== -1) {
          this.selectedFiles.splice(indx, 1);
        }
      }
      this.selectedOptions = new Array<object>();
      directory.writeValue(this.selectedOptions);
    }
  }

  UpOneFolder() {

    this.globusService.getDirectory(this.selectedDirectory,
        this.selectedEndPoint.id,
        this.transferData.userAccessTokenData.other_tokens[0].access_token)
        .pipe(flatMap(data => this.upFolderProcess(data)))
        .subscribe(
            data => {
              if (data !== null) {
                this.processDirectories(data);
              }
            },
            error => {
              console.log(error);
            },
            () => {
              this.checkFlag = false;
            }
        );
  }

  upFolderProcess(data) {
    const absolutePath = data.absolute_path;
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

  processDirectories(data) {
    console.log(data.data);
    this.selectedOptions = new Array<object>();
    this.personalDirectories = new Array<object>();
    this.selectedDirectory = data.path;
    for (const obj of data.data) {
      // if (obj.type === 'dir') {
      this.personalDirectories.push(obj);
      // }
    }
  }

  onSelection($event,  selectedFiles) {
    this.isSingleClick = true;
    setTimeout(() => {
      if (this.isSingleClick ){

        const file: SelFilesType = {fileNameObject: $event.option._value, directory: this.selectedDirectory };
        if ($event.option._selected) {
          console.log(file);
          console.log(this.selectedFiles);
          const indx = this.selectedFiles.findIndex(x =>
              x.fileNameObject === file.fileNameObject &&
              x.directory === file.directory
          );
          console.log(indx);
          if ( indx === -1) {
            this.selectedFiles.push(file);
          }
        } else {
          const indx = this.selectedFiles.indexOf(file);
          if ( indx !== -1) {
            this.selectedFiles.splice(indx, 1);
          }
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

  openDirectory($event, item, directory, check) {
    this.isSingleClick = false;
    this.selectedOptions = new Array<object>();
    if (item.type === 'dir') {
      this.selectedDirectory = this.selectedDirectory + item.name;

      this.globusService.getDirectory(this.selectedDirectory,
          this.selectedEndPoint.id,
          this.transferData.userAccessTokenData.other_tokens[0].access_token)
          .subscribe(
              data => {
                console.log(data);
                this.processDirectories(data);
              },
              error => {
                console.log(error);
              },
              () => {
                this.selectedOptions = new Array<object>();
                directory.writeValue(this.selectedOptions);
                check.checked = false;
              }
          );
    }
  }

  isFolder(item) {
    if (item.type === 'dir') {
      return true;
    } else {
      return false;
    }

  }

  removeAllFromSelected(directory) {
    this.selectedFiles = new Array<SelFilesType>();
    directory.writeValue(null);
    this.selectedOptions = new Array();
    this.checkFlag = false;
  }

  onRemoving($event, selectedList) {
    if ($event.option._selected) {
      const indx = this.selectedFiles.indexOf($event.option._value);
      if ( indx !== -1) {
        this.selectedFiles.splice(indx, 1);
        const indx2 = this.selectedOptions.indexOf($event.option._value.fileNameObject);
        if (indx2 !== -1) {
          this.selectedOptions.splice(indx2, 1);
          selectedList.writeValue(this.selectedOptions);
          this.checkFlag = false;
        }
      }
    }
  }

  selectedDirectoryExist() {
    if (typeof this.selectedDirectory !== 'undefined' && this.selectedDirectory !== null) {
      return true;
    } else {
      return false;
    }
  }

}
