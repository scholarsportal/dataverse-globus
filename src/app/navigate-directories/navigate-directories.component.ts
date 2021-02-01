import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {flatMap} from 'rxjs/operators';
import {GlobusService} from '../globus.service';
import {of} from 'rxjs';

interface SelFilesType {
  fileNameObject: any;
  directory: string;
}
@Component({
  selector: 'app-navigate-directories',
  templateUrl: './navigate-directories.component.html',
  styleUrls: ['./navigate-directories.component.css']
})



export class NavigateDirectoriesComponent implements OnInit {

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: any,
      public dialogRef: MatDialogRef<NavigateDirectoriesComponent>,
      private globusService: GlobusService
  ) { }

  checkFlag: boolean;
  personalDirectories: any;
  selectedOptions: any;
  selectedFiles: Array<SelFilesType>;
  selectedDirectory: any;
  selectedEndPont: any;
  userOtherAccessToken: string;
  isSingleClick: boolean;

  ngOnInit(): void {
    console.log(this.data);
    this.selectedEndPont = this.data;
  }

  preparedForTransfer() {
    return true;
  }

  selectAll($event, directory) {
    this.checkFlag = false;
    if ($event.checked) {
      for (const obj of this.personalDirectories) {
        this.selectedOptions.push(obj);
        const file: SelFilesType = {fileNameObject: obj, directory: this.selectedDirectory };
        this.selectedFiles.push(file);
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

    this.globusService.getDirectory(this.selectedDirectory, this.selectedEndPont.id, this.userOtherAccessToken)
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
    const absolutePath = data['absolute_path'];
    if (absolutePath !== null && absolutePath.localeCompare('/') !== 0) {
      const temp = absolutePath.substr(0, absolutePath.lastIndexOf('/') - 1);
      const path = temp.substr(0, temp.lastIndexOf('/')) + '/';
      return this.globusService.getDirectory(path, this.selectedEndPont.id, this.userOtherAccessToken);
    } else {
      return of(null);
    }
  }

  processDirectories(data) {
    this.selectedOptions = new Array<object>();
    this.personalDirectories = new Array<object>();
    this.selectedDirectory = data.path;
    for (const obj of data.DATA) {
      // if (obj.type === 'dir') {
      this.personalDirectories.push(obj);
      //}
    }
  }

  onSelection($event,  selectedFiles) {
    this.isSingleClick = true;
    setTimeout(() => {
      if (this.isSingleClick ){

        const file: SelFilesType = {fileNameObject: $event.option._value, directory: this.selectedDirectory };
        if ($event.option._selected) {
          this.selectedFiles.push(file);
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

      this.globusService.getDirectory(this.selectedDirectory, this.selectedEndPont.id, this.userOtherAccessToken)
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
    if (item['type'] === 'dir') {
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

  onSubmitTransfer() {

  }



}
