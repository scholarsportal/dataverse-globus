import { Component, OnInit } from '@angular/core';
import { GlobusService } from '../globus.service';
import {v4 as uuid } from 'uuid';
import {Observable, of, merge, from, forkJoin } from 'rxjs';
import {flatMap, map, tap, filter, concatMap} from 'rxjs/operators';
import {ConfigService} from '../config.service';

export interface Permissions {
    DATA_TYPE: string;
    principal_type: string;
    principal: string;
    path: string;
    permissions: string;
}

@Component({
  selector: 'app-interface',
  templateUrl: './interface.component.html',
  styleUrls: ['./interface.component.css']
})
export class InterfaceComponent implements OnInit {

  constructor(private globusService: GlobusService,
              private config: ConfigService) { }
  title: string;
  userAccessToken: string;
  userToken: string;
  personalConnectEndpoints: Array<object>;
  selectedValue: string;
  selectedEndPont: any;
  personalDirectories: any;
  selectedDirectory: any;
  basicClientToken: string;
  submissionId: string;
  directoryContent: any;
  listOfAllFiles: Array<string>;
  listOfFileNames: Array<string>;
  listOfAllStorageIdentifiers: Array<string>;
  datasetPid: string;
  key: string;
  datasetDirectory: string;
  userIdentity: string;
  globusEndpoint: string;
  siteUrl: string;

  userAccessTokenData: any;

  ngOnInit(): void {
      this.title = 'Globus';
      this.datasetDirectory = null;
      this.basicClientToken = this.config.basicGlobusToken;
      this.globusEndpoint = this.config.globusEndpoint;
      const code = this.globusService.getParameterByName('code');
      console.log(code);
      if (code === null || code === '') {
          this.datasetPid = this.globusService.getParameterByName('datasetPid');
          this.key = this.globusService.getParameterByName('apiToken');
          this.siteUrl = this.globusService.getParameterByName('siteUrl');
          console.log(this.siteUrl);
          const state = btoa(this.datasetPid + '_' + this.key + '_' + this.siteUrl); // encode
          this.getCode(state);
      } else {
          console.log(code);
          const state = this.globusService.getParameterByName('state');
          const decodedState = atob(state);
          console.log(decodedState);
          const parameters = decodedState.split('_');
          this.datasetPid = parameters[0];
          this.siteUrl = parameters[2];
          console.log(this.datasetPid);
          console.log(this.siteUrl);
          this.datasetDirectory = '/' + this.datasetPid.substring(this.datasetPid.indexOf(':') + 1) + '/';
          console.log(this.datasetPid);
          this.key = parameters[1];
          console.log(this.key);
       /*   this.getUserAccessToken(code)
              .pipe(flatMap(obj => this.getPersonalConnect(obj)))
              .pipe(flatMap(data => this.findDirectories(data)))
              .subscribe(
                  data => this.processDirectories(data),
                  error => console.log(error),
                  () => {}
              );*/
          this.getUserAccessToken(code);
      }
  }

  getPermission(clientToken, userIdentity) {
      const url = 'https://transfer.api.globusonline.org/v0.10/endpoint/' + this.config.globusEndpoint + '/access';
      const key = 'Bearer ' + clientToken;
      const permissions: Permissions = {
          DATA_TYPE: 'access',
          principal_type: 'identity',
          principal: userIdentity,
          path: this.datasetDirectory,
          permissions: 'rw'
      };
      const stringPermissions = JSON.stringify(permissions);
      console.log(stringPermissions);
      return this.globusService
          .postGlobus(url,  stringPermissions, key);
     /*     .subscribe(
              data => {
                  console.log('Data ');
                  console.log(data);
              },
              error => {
                  console.log(error);
                  if (error.status === 409) {
                      console.log('Rule already exists');
                      this.getPersonalConnect();
                  }
              },
              () => {
                  this.getPersonalConnect();
              });*/
  }

  getUserAccessToken(code) {
      console.log(code);
      const redirectURL = this.config.redirectURL;
      const url = 'https://auth.globus.org/v2/oauth2/token?code=' + code + '&redirect_uri=' + redirectURL + '&grant_type=authorization_code';
      console.log(url);
      const key = 'Basic ' + this.config.basicGlobusToken;
      return this.globusService.postGlobus(url,  '', key)
      /*----------------------*/
          .subscribe(
               data => {
                   console.log('Data ');
                   console.log(data);
                   this.userAccessTokenData = data;
               },
               error => {
                   console.log(error);
               },
               () => {
               });
   }

   getPersonalConnect(userAccessToken) {
       const url = 'https://transfer.api.globusonline.org/v0.10/endpoint_search?filter_scope=my-gcp-endpoints';
       console.log(userAccessToken);
       this.userAccessToken = userAccessToken.other_tokens[0].access_token;
       this.userToken = userAccessToken.access_token;
       return this.globusService
           .getGlobus(url, 'Bearer ' + userAccessToken.other_tokens[0].access_token);
   }

   getUserInfo(userToken) {
     const url = 'https://auth.globus.org/v2/oauth2/userinfo';
     console.log(userToken);
     return this.globusService
           .getGlobus(url,  'Bearer ' + userToken);
       /*    .subscribe(
               data => {
                   console.log('Data ');
                   console.log(data);
                   this.processUserInfo(data);
               },
               error => {
                   console.log(error);
               },
               () => {
                   this.getPermission();
               });*/
  }

  processUserInfo(data) {
      this.userIdentity = data.sub;
  }




  findDirectories(data) {
      console.log(data);
      this.processPersonalConnect(data);
      const url = 'https://transfer.api.globusonline.org/v0.10/operation/endpoint/' + this.selectedEndPont.id + '/ls';
      return this.globusService
      .getGlobus(url,  'Bearer ' + this.userAccessToken);
  }

  processDirectories(data) {
    this.personalDirectories = new Array<object>();
    for (const obj of data.DATA) {
      if (obj.type === 'dir') {
        this.personalDirectories.push(obj);
      }
    }
    console.log(this.personalDirectories);
  }

  getInnerDirectories(directory) {
    if (directory.DATA.length > 0) {
      const path = directory.path;
      console.log("Path");
      console.log(path);
      return merge(
        of(directory),
        from(directory.DATA)
          .pipe(filter(d => d["type"] === 'dir'))
          .pipe( flatMap(obj => this.getDirectory(path + obj["name"])))
          .pipe(flatMap(d => this.getInnerDirectories(d)) ));
    } else {
      return of(directory);
    }
  }

  getDirectory(path) {
    const url = 'https://transfer.api.globusonline.org/v0.10/operation/endpoint/' + this.selectedEndPont.id +
      '/ls?path=' + path;
    return this.globusService
      .getGlobus(url,  'Bearer ' + this.userAccessToken);
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
    }

  }

  processUserToken(data) {
    this.userAccessToken = data.other_tokens[0].access_token;
    this.userToken = data.access_token;
  }

  getCode(state) {
    const scope = encodeURI('openid+email+profile+urn:globus:auth:scope:transfer.api.globus.org:all');
    const client_id = this.config.globusClientId;
    let new_url =  'https://auth.globus.org/v2/oauth2/authorize?client_id=' + client_id + '&response_type=code&' +
      'scope=' + scope + '&state=' + state;
    new_url = new_url + '&redirect_uri=' + this.config.redirectURL ;

    const myWindows = window.location.replace(new_url);
  }

  getClientToken() {
    const url = 'https://auth.globus.org/v2/oauth2/token?scope=openid+email+profile+urn:globus:auth:scope:transfer.api.globus.org:all&grant_type=client_credentials';

    const key = 'Basic ' + this.config.basicGlobusToken;
    this.globusService
      .postGlobus(url,  '', key);
     /* .subscribe(
        data => {
          console.log('Data ');
          console.log(data);
          this.clientToken = data['other_tokens'][0].access_token;
        },
        error => {
          console.log(error);
        },
        () => {
          this.getUserInfo();
        });*/

  }

  onSubmitTransfer() {
      this.getClientToken();
      //this.getUserInfo()



  }

  /*submitTransfer() {
    console.log(this.clientToken);
    const url = 'https://transfer.api.globusonline.org/v0.10/submission_id';
    this.globusService
      .getGlobus(url,  'Bearer ' + this.userAccessToken)
      .subscribe(
        data => {
          console.log('Data ');
          console.log(data);
          this.submissionId = data['value'];
          console.log(this.submissionId);
        },
        error => {
          console.log(error);
        },
        () => {
          this.transferItem();
        });
  }*/

  generateStorageIdentifier() {
    const identifier = uuid();
    console.log(identifier);

    // last 6 bytes, of the random UUID, in hex:

    const hexRandom = identifier.substring(24);
    console.log( hexRandom);
    const hexTimestamp = new Date().getTime().toString(16);
    console.log(hexTimestamp);
    const storageIdentifier = hexTimestamp + '-' + hexRandom;
    console.log(storageIdentifier);
    return storageIdentifier;
  }


  transferItem() {

    const directory = this.selectedEndPont.default_directory  + this.selectedDirectory.name;
    console.log("Attention!");
    this.listOfAllFiles = new Array<string>();
    this.listOfFileNames = new Array<string>();
    this.listOfAllStorageIdentifiers = new Array<string>();
    this.getDirectory(directory).pipe(flatMap(d => this.getInnerDirectories(d)))
      .subscribe(
        dir => {
          console.log(dir);
          for (const obj of dir["DATA"]) {
            if (obj.type === 'file') {
              console.log(obj);
              this.listOfAllFiles.push(dir["absolute_path"] + obj.name);
              this.listOfFileNames.push(obj.name);
              this.listOfAllStorageIdentifiers.push(this.generateStorageIdentifier());
            }
          }
        },
        error => {
          console.log(error);
        },
        () => {
          console.log('-----------------------');
          console.log(this.listOfAllFiles);
          console.log('----------------------');
          this.submitTransferItems();
        }
        );

  }

  submitTransferItems() {
    const url = 'https://transfer.api.globusonline.org/v0.10/transfer';
    const taskItemsArray = new Array();
    for (let i = 0; i < this.listOfAllFiles.length; i++) {
      const taskItem = {
        DATA_TYPE: 'transfer_item',
        source_path: this.listOfAllFiles[i],
        destination_path : this.datasetDirectory + this.listOfAllStorageIdentifiers[i],
        recursive: false
      };
      taskItemsArray.push(taskItem);
    }
    const body = {
      DATA_TYPE: 'transfer',
      DATA: taskItemsArray,
      submission_id: this.submissionId,
      notify_on_succeeded: true,
      notify_on_failed: true,
      source_endpoint: this.selectedEndPont.id,
      destination_endpoint: this.config.globusEndpoint
    };
    const bodyString = JSON.stringify(body);
    console.log(bodyString);
    this.globusService
      .postGlobus(url,  bodyString,'Bearer ' + this.userAccessToken)
      .subscribe(
        data => {
          console.log('Data ');
          console.log(data);
        },
        error => {
          console.log(error);
        },
        () => {
        });
  }

 /* onSubmitTransfer() {
    console.log('Submitting');
    this.getClientToken();
  }*/

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
    if (typeof this.selectedDirectory !== 'undefined'  && typeof this.selectedDirectory !== 'undefined') {
      return true;
    } else {
      return false;
    }
  }
}
