import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {catchError, flatMap} from 'rxjs/operators';
import {forkJoin, of, throwError} from 'rxjs';
import {GlobusService} from '../globus.service';
import {TransferData} from '../upload/upload.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldControl, MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatListModule, MatListOption} from '@angular/material/list';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatInputModule} from '@angular/material/input';
import {CdkFixedSizeVirtualScroll, CdkVirtualScrollViewport} from '@angular/cdk/scrolling';

export interface SelFilesType {
  fileNameObject: any;
  directory: string;
}

@Component({
  selector: 'app-navigate-template',
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
    MatInputModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll
  ],
  templateUrl: './navigate-template.component.html',
  styleUrls: ['./navigate-template.component.css']
})
export class NavigateTemplateComponent implements OnInit, OnChanges {

  constructor(private globusService: GlobusService,
              public snackBar: MatSnackBar) {
  }

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
  ruleId: string;
  clientToken: any;

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.startComponent();
  }

  startComponent() {
    this.load = false;
    this.ruleId = null;
    this.clientToken = null;
    console.log(this.transferData.datasetDirectory);
    console.log(this.selectedEndPoint);
    this.accessEndpointFlag = false;
    this.selectedFiles = new Array<SelFilesType>();
    this.checkFlag = false;
    this.isSingleClick = true;
    this.listOfAllFiles = new Array<string>();
    this.listOfFileNames = new Array<string>();
    this.listOfDirectoryLabels = new Array<string>();
    this.listOfAllStorageIdentifiers = new Array<string>();
    if (typeof this.transferData.userAccessTokenData !== 'undefined' && typeof this.selectedEndPoint !== 'undefined') {
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
    const url = 'https://transfer.api.globusonline.org/v0.10/operation/endpoint/' + this.selectedEndPoint.id + '/ls';
    return this.globusService
        .getGlobus(url, 'Bearer ' + this.transferData.userAccessTokenData.other_tokens[0].access_token);

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
    return this.selectedFiles.length > 0;
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
    let absolutePath = data.absolute_path;
    if (data.absolute_path == null || data.absolute_path === 'null') {
      absolutePath = data["path"];
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

  processDirectories(data) {
    this.selectedOptions = new Array<object>();
    this.personalDirectories = new Array<object>();
    this.selectedDirectory = data.path;
    for (const obj of data.DATA) {
      // if (obj.type === 'dir') {
      this.personalDirectories.push(obj);
      // }
    }
  }

  onSelection(selectedFile: MatListOption[]) {
    console.log(selectedFile);
    const files = selectedFile.map(o => o.value);
    this.isSingleClick = true;
    setTimeout(() => {
      if (this.isSingleClick ) {
        console.log('It is single click');
        this.selectedFiles = new Array<SelFilesType>();
        files.forEach(file => {
          this.selectedFiles.push({fileNameObject: file, directory: this.selectedDirectory});
        });
        console.log(this.selectedFiles);
        //
        //     if (selectedFile.) {
        //       console.log("event selected");
        //       console.log(file);
        //       console.log(this.selectedFiles);
        //       const indx = this.selectedFiles.findIndex(x =>
        //         x.fileNameObject === file.fileNameObject &&
        //         x.directory === file.directory
        //       );
        //       console.log(indx);
        //       if ( indx === -1) {
        //         this.selectedFiles.push(file);
        //       }
        //     } else {
        //       const indx = this.selectedFiles.indexOf(file);
        //       if ( indx !== -1) {
        //         this.selectedFiles.splice(indx, 1);
        //       }
        //       this.checkFlag = false;
        //     }
        //   }
      }
      }, 250);
  }

  checkBox($event, item) {
    if (!$event.checked) {
      console.log("Check flag");
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
    return item.type === 'dir';

  }

  removeAllFromSelected(directory) {
    this.selectedFiles = new Array<SelFilesType>();
    directory.writeValue(null);
    this.selectedOptions = [];
    this.checkFlag = false;
  }

  onRemoving(selectedFile: MatListOption[], selectedList) {
    console.log(selectedFile);
    console.log(selectedList);
    const files = selectedFile.map(o => o.value);
    // this.isSingleClick = true;
    // setTimeout(() => {
    //   if (this.isSingleClick ) {
    //     console.log('It is single click');
    //
    files.forEach(file => {
      const indx = this.selectedFiles.indexOf(file);
      console.log(indx);
      if ( indx !== -1) {
        this.selectedFiles.splice(indx, 1);
        const indx2 = selectedList._value.indexOf(file);
        if (indx2 !== -1) {
          console.log("Hello");
          selectedList._value.splice(indx2);
          this.checkFlag = false;
        }
      }
      });
    //     console.log(this.selectedFiles);
        //
        //     if (selectedFile.) {
        //       console.log("event selected");
        //       console.log(file);
        //       console.log(this.selectedFiles);
        //       const indx = this.selectedFiles.findIndex(x =>
        //         x.fileNameObject === file.fileNameObject &&
        //         x.directory === file.directory
        //       );
        //       console.log(indx);
        //       if ( indx === -1) {
        //         this.selectedFiles.push(file);
        //       }
        //     } else {
        //       const indx = this.selectedFiles.indexOf(file);
        //       if ( indx !== -1) {
        //         this.selectedFiles.splice(indx, 1);
        //       }
        //       this.checkFlag = false;
        //     }
        //   }
    //   }
    // }, 250);




    //   $event, selectedList) {
    // if ($event.option._selected) {
    //   const indx = this.selectedFiles.indexOf($event.option._value);
    //   if ( indx !== -1) {
    //     this.selectedFiles.splice(indx, 1);
    //     const indx2 = this.selectedOptions.indexOf($event.option._value.fileNameObject);
    //     if (indx2 !== -1) {
    //       this.selectedOptions.splice(indx2, 1);
    //       selectedList.writeValue(this.selectedOptions);
    //       this.checkFlag = false;
    //     }
    //   }
    // }
  }

  onSubmitTransfer() {
    console.log(this.transferData.datasetPid);
    if (this.transferData.datasetPid.localeCompare('null') !== 0) {
      this.snackBar.open('Preparing transfer', '', {
        duration: 3000
      });
      const directoriesArray = [];
      const labelsArray = [];

      for (const obj of this.selectedFiles) {
        if (obj.fileNameObject.type === 'dir') {
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
        this.findAllSubFiles(directoriesArray, 0, labelsArray);
      } else {
        if (this.listOfAllFiles.length > 0) {
          const user = this.globusService.getUserInfo(this.transferData.userAccessTokenData.access_token);

          const client = this.globusService.getClientToken(this.transferData.basicClientToken);

          const array = [user, client]; // forkJoin;
          this.submit(array);
        }
      }
    } else {
      this.snackBar.open('Dataset directory is not provided', '', {
        duration: 3000
      });
    }
  }

  findAllSubFiles(directory, i, labelsArray) {
    this.globusService.getDirectory(directory[i],
        this.selectedEndPoint.id, this.transferData.userAccessTokenData.other_tokens[0].access_token)
        .pipe(flatMap(d => this.globusService.getInnerDirectories(d, this.selectedEndPoint.id,
            this.transferData.userAccessTokenData.other_tokens[0].access_token)))
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
                const user = this.globusService.getUserInfo(this.transferData.userAccessTokenData.access_token);
                console.log(user);

                const client = this.globusService.getClientToken(this.transferData.basicClientToken);

                const array = [user, client]; // forkJoin;
                this.submit(array);
              }
            }
        );
  }

  saveDirectories(dir, i, labelsArray) {
    const label = dir.path.substr(labelsArray[i].length);
    for (const obj of dir.DATA) {
      if (obj.type === 'file') {
        if (dir.absolute_path == null || dir.absolute_path === 'null') {
          this.listOfAllFiles.push(dir.path + obj.name);
        } else {
          this.listOfAllFiles.push(dir.absolute_path + obj.name);
        }
        this.listOfFileNames.push(obj.name);
        this.listOfAllStorageIdentifiers.push(this.globusService.generateStorageIdentifier());

        this.listOfDirectoryLabels.push(label);
      }
    }
  }

  submit(array) {
    console.log("Submitting");
    console.log(array);
    console.log(this.transferData.globusEndpoint);
    this.globusService.submitTransfer(this.transferData.userAccessTokenData.other_tokens[0].access_token)
        .pipe( flatMap(data => this.globusService.submitTransferItems(
              this.listOfAllFiles,
              this.transferData.datasetDirectory,
              this.listOfAllStorageIdentifiers,
              data['value'],
              this.selectedEndPoint.id,
              this.transferData.globusEndpoint,
              this.transferData.userAccessTokenData.other_tokens[0].access_token)))
        .subscribe(
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
                this.writeToDataverse(array);
              });
  }

  // submit(array) {
  //   console.log(array);
  //   console.log('Start submitting!!!');
  //   forkJoin(array)
  //       .pipe(flatMap(obj => {
  //         this.clientToken = obj[1];
  //         console.log(obj);
  //         return this.globusService.getPermission(obj[1], obj[0],
  //                 this.transferData.datasetDirectory,
  //                 this.transferData.globusEndpoint, 'rw');
  //           }),
  //           catchError(err => {
  //             console.log(err);
  //             if (err.status === 409) {
  //               console.log('Rule exists');
  //               return of(err);
  //             } else {
  //               return throwError(err); } }
  //           ))
  //       .pipe(flatMap(data => {
  //           this.ruleId = data.access_id;
  //           return this.globusService.submitTransfer(this.transferData.userAccessTokenData.other_tokens[0].access_token);
  //           }
  //           ))
  //           .pipe( flatMap(data => this.globusService.submitTransferItems(
  //           this.listOfAllFiles,
  //           this.transferData.datasetDirectory,
  //           this.listOfAllStorageIdentifiers,
  //           data['value'],
  //           this.selectedEndPoint.id,
  //           this.transferData.globusEndpoint,
  //           this.transferData.userAccessTokenData.other_tokens[0].access_token)))
  //       .subscribe(
  //           data => {
  //             console.log(data);
  //             this.taskId = data['task_id'];
  //           },
  //           error => {
  //             console.log(error);
  //             this.snackBar.open('There was an error in transfer submission. BIIG ', '', {
  //               duration: 3000
  //             });
  //           },
  //           () => {
  //             console.log('Transfer submitted');
  //             this.writeToDataverse();
  //           }
  //       );
  // }

  writeToDataverse(array) {
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

    // const url = 'https://dvdev.scholarsportal.info/api/datasets/:persistentId/addglobusFiles?persistentId=' + this.datasetPid;
    //const url = this.transferData.siteUrl + '/api/datasets/:persistentId/addGlobusFiles?persistentId=' + this.transferData.datasetPid;
    const formData: any = new FormData();



    console.log(this.listOfDirectoryLabels);
    console.log(this.listOfAllStorageIdentifiers);
    let body = '{ \"taskIdentifier\": \"' + this.taskId + '\"'; // + " , \"files\": [';
    if (this.ruleId !== null && typeof this.ruleId !== 'undefined') {
      body = body + ',\"ruleId\":' + '\"' + this.ruleId + '\"';
    } else {
      body = body + ',\"ruleId\":' + '\"' + '\"';
    }
    body = body + ', \"files\": [';
    let file = '';
    for (let i = 0; i < this.listOfAllStorageIdentifiers.length; i++) {
      if (i > 0) {
        file = ',';
      } else {
        file = '';
      }
      file = file + '{ \"description\": \"\", \"directoryLabel\": \"' +
          this.listOfDirectoryLabels[i] + '\", \"restrict\": \"false\",' +
          '\"storageIdentifier\":\"' + 's3://dataverse:' + // this.transferData.storePrefix +
          this.listOfAllStorageIdentifiers[i] + '\",' +
          '\"fileName\":' + '\"' + this.listOfFileNames[i] + '\"'; // + ' }';
      file = file +  ' } ';
      body = body + file;
    }
    body = body + ']}';
    console.log(body);
    formData.append('jsonData', body);
    console.log(this.transferData.signedUrls);
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


    let url = '';
    let url_path = '';
    for (const urlObject  of this.transferData.signedUrls) {
      console.log(urlObject);
      if (urlObject['name'] === 'addGlobusFiles') {
        url = urlObject['signedUrl'];
      }
      if (urlObject['name'] === 'requestGlobusTransferPaths') {
        url_path = urlObject['signedUrl'];
      }
    }
    console.log(url);

    forkJoin(array)
        .pipe(flatMap(obj=> {
              let path_json = '{ ' +
                  '  "principal":"' + obj[0] + '",' +
                  '  "numberOfFiles":' + this.listOfAllStorageIdentifiers.length + '}';
              console.log(path_json);

        }))

    this.globusService.postSimpleDataverse(url_path, path_json)
        .subscribe(
            data => {
              console.log(data);
            },
            error => {
              console.log(error);
            },
            () => {

            });
        .subscribe( data => {console.log(data); } ,
            error = {}, () =>
            this.globusService.postDataverse(url, formData, this.transferData.key)
                .subscribe(
                    data => {
                      console.log(data);
                    },
                    error => {
                      console.log(error);
                      // this.removeRule();
                      this.snackBar.open('There was an error in transfer submission. ', '', {
                        duration: 3000
                      });
                    },
                    () => {
                      console.log('Submitted to dataverse');
                      // this.removeRule();
                      const urlDataset = this.transferData.siteUrl + '/' +
                          'dataset.xhtml?persistentId=' + this.transferData.datasetPid;
                      this.snackBar.open(
                          'Transfer was initiated. \n Go to the dataverse dataset to monitor the progress.',
                          '', {
                            duration: 5000
                          });
                    }
                );
        )
  }

  removeRule() {
    console.log(this.ruleId);
    if (this.ruleId !== null && this.clientToken !== null && typeof this.ruleId !== 'undefined') {
      this.globusService.deleteRule(this.ruleId, this.transferData.globusEndpoint, this.clientToken)
          .subscribe(
              data => {
              },
              error => {
                console.log(error);
              },
              () => {
                console.log('Rule deleted');
              }
          );
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
