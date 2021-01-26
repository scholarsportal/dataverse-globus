import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {GlobusService} from '../globus.service';
import {catchError, flatMap} from 'rxjs/operators';
import {forkJoin, of, throwError} from 'rxjs';

interface SelFilesType {
  fileNameObject: any;
  directory: string;
}

@Component({
  selector: 'app-recently-viewed-component',
  templateUrl: './recently-viewed-component.component.html',
  styleUrls: ['./recently-viewed-component.component.css']
})
export class RecentlyViewedComponentComponent implements OnChanges, OnInit {

  selectedEndPont: any;
  recentlyViewedEndpoints: Array<object>;
  selectedDirectory: any;
  recentlyViewedDirectories: any;

  userOtherAccessToken: string;
  userAccessToken: string;
  clientToken: string;

  listOfAllFiles: Array<string>;
  listOfFileNames: Array<string>;
  listOfAllStorageIdentifiers: Array<string>;
  listOfDirectoryLabels: Array<string>;
  submissionId: string;
  selectedFiles: Array<SelFilesType>;
  isSingleClick: boolean;
  selectedOptions: any;
  checkFlag: boolean;
  taskId: string;

  constructor(private globusService: GlobusService) { }

  @Input() userAccessTokenData: any;
  @Input() basicClientToken: string;
  @Input() datasetDirectory: string;
  @Input() globusEndpoint: string;
  @Input() datasetPid: string;
  @Input() key: string;

  ngOnInit(): void {
    console.log(this.userAccessTokenData);
    this.selectedDirectory = null;
    this.selectedFiles = new Array<SelFilesType>();
    this.isSingleClick = true;
    this.checkFlag = false;
  }

  ngOnChanges() {

    this.selectedFiles = new Array<SelFilesType>();
    this.checkFlag = false;
    this.isSingleClick = true;
    console.log(this.userAccessTokenData);
    this.listOfAllFiles = new Array<string>();
    this.listOfFileNames = new Array<string>();
    this.listOfDirectoryLabels = new Array<string>();
    this.listOfAllStorageIdentifiers = new Array<string>();
    if (typeof this.userAccessTokenData !== 'undefined') {
      this.getRecentlyViewedEndpoints(this.userAccessTokenData)
          .pipe(flatMap(data => this.findDirectories(data)))
          .subscribe(
              data => this.processDirectories(data),
              error => console.log(error),
              () => {
                console.log(this.checkFlag);
              }
          );
    }
  }


  getRecentlyViewedEndpoints(userAccessTokenData) {
    const url = 'https://transfer.api.globusonline.org/v0.10/endpoint_search?filter_scope=recently-used';
    console.log(userAccessTokenData);
    this.userOtherAccessToken = userAccessTokenData.other_tokens[0].access_token;
    this.userAccessToken = userAccessTokenData.access_token;
    return this.globusService
        .getGlobus(url, 'Bearer ' + this.userOtherAccessToken);
  }

  findDirectories(data) {
    console.log(data);
    this.processPersonalConnect(data);
    const url = 'https://transfer.api.globusonline.org/v0.10/operation/endpoint/' + this.selectedEndPont.id + '/ls';
    return this.globusService
        .getGlobus(url,  'Bearer ' + this.userOtherAccessToken);
  }

  processPersonalConnect(data) {
    console.log("Process personal connect");
    this.recentlyViewedEndpoints = new Array<object>();
    console.log(data);
    for (const obj of data.DATA) {
        this.recentlyViewedEndpoints.push(obj);

    }
    if (this.recentlyViewedEndpoints.length === 0) {
      console.log('Globus Personal Connect is not connected');
    } else {
      this.selectedEndPont = this.recentlyViewedEndpoints[0];
      if (this.selectedEndPont.default_directory == null) {
        this.selectedDirectory = '~/';
      } else {
        this.selectedDirectory = this.selectedEndPont.default_directory;
      }
    }

  }

  processDirectories(data) {
    this.selectedOptions = new Array<object>();
    this.recentlyViewedDirectories = new Array<object>();
    this.selectedDirectory = data.path;
    for (const obj of data.DATA) {
      // if (obj.type === 'dir') {
      this.recentlyViewedDirectories.push(obj);
      //}
    }
  }

  recentlyViewedExist() {
    if (typeof this.recentlyViewedEndpoints !== 'undefined' && this.recentlyViewedEndpoints.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  setSelectedEndpoint(event) {
    this.selectedEndPont = event.value;
    const url = 'https://transfer.api.globusonline.org/v0.10/operation/endpoint/' + this.selectedEndPont.id + '/ls';
    return this.globusService
        .getGlobus(url,  'Bearer ' + this.userOtherAccessToken)
        .subscribe(
            data => this.processDirectories(data),
            error => console.log(error),
            () => {
              this.selectedFiles = new Array<SelFilesType>();
            }
        );
  }

  searchDirectory(directory) {
    this.checkFlag = false;
    this.selectedDirectory = directory;
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
            }
        );
  }

  preparedForTransfer() {
    if (typeof this.selectedDirectory !== 'undefined' &&  this.selectedDirectory !== null && this.selectedDirectory.length >0 ) {
      return true;
    } else {
      return false;
    }
  }

  selectAll($event, directory) {
    this.checkFlag = false;
    if ($event.checked) {
      for (const obj of this.recentlyViewedDirectories) {
        this.selectedOptions.push(obj);
        const file: SelFilesType = {fileNameObject: obj, directory: this.selectedDirectory };
        this.selectedFiles.push(file);
      }
      this.checkFlag = true;
      directory.writeValue(this.recentlyViewedDirectories);
    } else {
      this.checkFlag = false;
      for (const obj of this.recentlyViewedDirectories) {

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
    const directoriesArray = new Array();
    const labelsArray = new Array();

    for (const obj of this.selectedFiles ) {
      if (obj.fileNameObject['type'] === 'dir') {
        directoriesArray.push(obj.directory + obj.fileNameObject.name);
        labelsArray.push(obj.directory);
      } else {
        this.listOfAllFiles.push(obj.directory + obj.fileNameObject.name);
        this.listOfFileNames.push(obj.fileNameObject.name);
        this.listOfAllStorageIdentifiers.push(this.globusService.generateStorageIdentifier());
        this.listOfDirectoryLabels.push('');
      }
    }
    if (directoriesArray.length > 0) {
      this.findAllSubFiles(directoriesArray, 0, labelsArray );
    } else {
      if (this.listOfAllFiles.length > 0) {
        const user = this.globusService.getUserInfo(this.userAccessToken);

        const client = this.globusService.getClientToken(this.basicClientToken);

        const array = [user, client]; // forkJoin;
        this.submit(array);
      }
    }
  }

  findAllSubFiles(directory, i, labelsArray) {
    this.globusService.getDirectory(directory[i], this.selectedEndPont.id, this.userOtherAccessToken)
        .pipe(flatMap(d => this.globusService.getInnerDirectories(d, this.selectedEndPont.id, this.userOtherAccessToken)))
        .subscribe(
            dir => {
              this.saveDirectories(dir, i, labelsArray);
            },
            error => {
              console.log(error);
            },
            () => {
              i = i + 1;
              if (i < directory.length) {
                this.findAllSubFiles(directory, i, labelsArray);
                // this.submit(array);
              } else {
                const user = this.globusService.getUserInfo(this.userAccessToken);

                const client = this.globusService.getClientToken(this.basicClientToken);

                const array = [user, client]; // forkJoin;
                this.submit(array);
              }
            }
        );
  }

  submit(array) {
    forkJoin(array)
        .pipe(flatMap(obj => this.globusService.getPermission(obj[1], obj[0], this.datasetDirectory, this.globusEndpoint)),
            catchError(err => {
              console.log(err);
              if (err.status === 409) {
                console.log('Rule exists');
                return of(err);
              } else {
                return throwError(err); } }
            ))
        .pipe(data => this.globusService.submitTransfer(this.userOtherAccessToken))
        .pipe( flatMap(data => this.globusService.submitTransferItems(
            this.listOfAllFiles,
            this.datasetDirectory,
            this.listOfAllStorageIdentifiers,
            data['value'],
            this.selectedEndPont.id,
            this.globusEndpoint,
            this.userOtherAccessToken)))
        .subscribe(
            data => {
              console.log(data);
              this.taskId = data['task_id'];
            },
            error => {
              console.log(error);
            },
            () => {
              console.log('Transfer submitted');
              this.writeToDataverse();
            }
        );
  }

 writeToDataverse() {
    /*{
      "taskIdentifier":"d2ae147e-446a-11eb-8ffa-0a34088e79f9",
        "files": [
      {
        "description":"My jpg-j description.",
        "directoryLabel":"data/subdir2",
        "restrict":"false",
        "storageIdentifier":"s3://1762f94da75-e29bf77450b0",
        "fileName":"test-j.jpg",
        "contentType":"image/jpeg"
      }
    ]
    } */

    // curl -H X-Dataverse-key:c1428301-e301-4818-95d8-0fc01fd1d242 -X POST https://dvdev.scholarsportal.info/api/globus/:persistentId/add?persistentId=doi:10.5072/FK2/IMK6JR -F jsonData=@mytest.json
    // "Content-Type", "application/json;
    // const url = 'https://dvdev.scholarsportal.info/api/globus/:persistentId/add?persistentId=' + this.datasetPid;

    const url = 'https://dvdev.scholarsportal.info/api/datasets/:persistentId/addglobusFiles?persistentId=' + this.datasetPid;
    const formData: any = new FormData();

    console.log(this.listOfDirectoryLabels);
    console.log(this.listOfAllStorageIdentifiers);
    let body = '{ \"taskIdentifier\": \"' + this.taskId + '\", \"files\": [';
    let file = '';
    for (let i = 0; i < this.listOfAllStorageIdentifiers.length; i++) {
      if (i > 0) {
        file = ',';
      } else {
        file = '';
      }
      file = file + '{ \"description\": \"\", \"directoryLabel\": \"' +
          this.listOfDirectoryLabels[i] + '\", \"restrict\": \"false\",' +
          '\"storageIdentifier\":' + '\"s3://' + this.listOfAllStorageIdentifiers[i] + '\",' +
          '\"fileName\":' + '\"' + this.listOfFileNames[i] + '\",' +
          '\"contentType\": \"plain/text\" }';
      body = body + file;
    }
    body = body + ']}';
    console.log(body);
    /* {
          description: '',
          directoryLabel: this.listOfDirectoryLabels[0],
          restrict: 'false',
          storageIdentifier: 's3://' + this.listOfAllStorageIdentifiers[0],
          fileName: this.listOfFileNames[0],
          contentType: 'plain/text'
        }


    const bodyString = JSON.stringify(body);
*/
    formData.append('jsonData', body);
    this.globusService.postDataverse(url, formData, this.key)
        .subscribe(
            data => {
              console.log(data);
            },
            error => {
              console.log(error);
            },
            () => {
              console.log('Submitted to dataverse');
            }
        );
  }

  saveDirectories(dir, i, labelsArray) {
    const label = dir['path'].substr(labelsArray[i].length);
    for (const obj of dir["DATA"]) {
      if (obj.type === 'file') {
        this.listOfAllFiles.push(dir["absolute_path"] + obj.name);
        this.listOfFileNames.push(obj.name);
        this.listOfAllStorageIdentifiers.push(this.globusService.generateStorageIdentifier());

        this.listOfDirectoryLabels.push(label);
      }
    }
  }

}
