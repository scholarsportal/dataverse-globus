import {Component, Input, NgModule, OnChanges, OnInit} from '@angular/core';
import {GlobusService} from '../globus.service';
import {catchError, filter, flatMap} from 'rxjs/operators';
import {v4 as uuid } from 'uuid';
import {forkJoin, from, merge, of, pipe, throwError} from 'rxjs';

@Component({
  selector: 'app-personal-connect',
  templateUrl: './personal-connect.component.html',
  styleUrls: ['./personal-connect.component.css']
})
export class PersonalConnectComponent implements OnChanges, OnInit {

  selectedEndPont: any;
  personalConnectEndpoints: Array<object>;
  selectedDirectory: any;
  personalDirectories: any;

  userOtherAccessToken: string;
  userAccessToken: string;
  clientToken: string;

  listOfAllFiles: Array<string>;
  listOfFileNames: Array<string>;
  listOfAllStorageIdentifiers: Array<string>;
  submissionId: string;
  selectedFiles: any;

  constructor(private globusService: GlobusService) { }

  @Input() userAccessTokenData: any;
  @Input() basicClientToken: string;
  @Input() datasetDirectory: string;
  @Input() globusEndpoint: string;

  ngOnInit(): void {
    console.log(this.userAccessTokenData);
    this.selectedDirectory = null;
  }

  ngOnChanges() {
    console.log(this.userAccessTokenData);
    this.listOfAllFiles = new Array<string>();
    this.listOfFileNames = new Array<string>();
    this.listOfAllStorageIdentifiers = new Array<string>();
    if (typeof this.userAccessTokenData !== 'undefined') {
      this.getPersonalConnect(this.userAccessTokenData)
          .pipe(flatMap(data => this.findDirectories(data)))
          .subscribe(
              data => this.processDirectories(data),
              error => console.log(error),
              () => {
              }
          );
    }
  }

  getPersonalConnect(userAccessTokenData) {
    const url = 'https://transfer.api.globusonline.org/v0.10/endpoint_search?filter_scope=my-gcp-endpoints';
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
    this.personalConnectEndpoints = new Array<object>();
    for (const obj of data.DATA) {
      if (obj.gcp_connected) {
        this.personalConnectEndpoints.push(obj);
        console.log(obj);
      }
    }
    if (this.personalConnectEndpoints.length === 0) {
      console.log('Globus Personal Connect is not connected');
    } else {
      this.selectedEndPont = this.personalConnectEndpoints[0];
      if (this.selectedEndPont.default_directory == null) {
        this.selectedDirectory = '~/';
      } else {
        this.selectedDirectory = this.selectedEndPont.default_directory;
      }
    }

  }

  processDirectories(data) {
    this.selectedDirectory = data.path;
    this.personalDirectories = new Array<object>();
    for (const obj of data.DATA) {
     // if (obj.type === 'dir') {
        this.personalDirectories.push(obj);
      //}
    }
    console.log(this.personalDirectories);
  }

  personalConnectExist() {
    if (typeof this.personalConnectEndpoints !== 'undefined' && this.personalConnectEndpoints.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  personalDirectoryExist() {
    if (typeof this.personalDirectories !== 'undefined' && this.personalDirectories.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  preparedForTransfer() {
    if (typeof this.selectedDirectory !== 'undefined' &&  this.selectedDirectory !== null && this.selectedDirectory.length >0 ) {
      return true;
    } else {
      return false;
    }
  }


  onSubmitTransfer() {
    console.log(this.selectedFiles);

    const directoriesArray = new Array();
    for (const obj of this.selectedFiles ) {

      console.log(this.selectedDirectory + obj.name);
      if (obj['type'] === 'dir') {
        directoriesArray.push(this.selectedDirectory + obj.name);
      } else {

        this.listOfAllFiles.push(this.selectedDirectory + obj.name);
        this.listOfFileNames.push(obj.name);
        this.listOfAllStorageIdentifiers.push(this.globusService.generateStorageIdentifier());
      }
    }
    console.log(directoriesArray);
    if (directoriesArray.length > 0) {
      this.findAllSubFiles(directoriesArray, 0);
    } else {
      if (this.listOfAllFiles.length > 0) {
        const user = this.globusService.getUserInfo(this.userAccessToken);

        const client = this.globusService.getClientToken(this.basicClientToken);

        const array = [user, client]; // forkJoin;
        this.submit(array);
      }
    }
  }

  findAllSubFiles(directory, i) {
    this.globusService.getDirectory(directory[i], this.selectedEndPont.id, this.userOtherAccessToken)
        .pipe(flatMap(d => this.globusService.getInnerDirectories(d, this.selectedEndPont.id, this.userOtherAccessToken)))
        .subscribe(
            dir => {
              this.saveDirectories(dir);
            },
            error => {
              console.log(error);
            },
            () => {
              i = i + 1;
              if (i < directory.length) {
                this.findAllSubFiles(directory, i);
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

  saveDirectories(dir) {
    console.log(dir);
    for (const obj of dir["DATA"]) {
      if (obj.type === 'file') {
        console.log(obj);
        this.listOfAllFiles.push(dir["absolute_path"] + obj.name);
        this.listOfFileNames.push(obj.name);
        this.listOfAllStorageIdentifiers.push(this.globusService.generateStorageIdentifier());
      }
    }
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
            },
            error => {
              console.log(error);
            },
            () => {
              console.log('Transfer submitted');
            }
        );
  }

  openDirectory($event, item) {
    console.log($event);
    console.log("Open Directory");
    console.log(item);
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
              }
          );
    }
  }

  checkBox($event, item) {
    console.log("Check box");
    console.log($event);
  }

  searchDirectory(directory) {
    console.log(directory);
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

  onSelection($event, selectedFiles) {
    this.selectedFiles = new Array();
    for (let obj of selectedFiles._selection) {
      this.selectedFiles.push(obj._value);
    }

  }

}
