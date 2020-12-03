import { Component, OnInit } from '@angular/core';
import { GlobusService } from '../globus.service';
import {v4 as uuid } from 'uuid';
import {Observable, of, merge, from, forkJoin } from 'rxjs';
import {flatMap, map, tap, filter } from 'rxjs/operators';
import {ConfigService} from '../config.service';

interface Directory {
  name: string;
  path: string;
  files: Array<string>;
  directories: Array<string>;
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
  personalConnectEndpoints: Array<object>;
  selectedValue: string;
  selectedEndPont: any;
  personalDirectories: any;
  selectedDirectory: any;
  clientToken: string;
  submissionId: string;
  directoryContent: any;
  listOfAllFiles: Array<string>;
  listOfFileNames: Array<string>;
  listOfAllStorageIdentifiers: Array<string>;

  ngOnInit(): void {
    this.title = 'Globus';

    const code = this.globusService.getParameterByName('code');
    console.log(code);
    if (code === null || code === '') {
      this.getCode();
    } else {
      console.log(code);
      this.generateStorageIdentifier();
      this.getUserAccessToken(code);
    }

  }

  getUserAccessToken(code) {
    const redirectURL = this.config.redirectURL;
    const url = 'https://auth.globus.org/v2/oauth2/token?code=' + code + '&redirect_uri=' + redirectURL + '&grant_type=authorization_code';
    console.log(url);
    const key = 'Basic ' + this.config.basicGlobusToken;
    this.globusService
      .postGlobus(url,  '', key)
      .subscribe(
        data => {
          console.log('Data ');
          console.log(data);
          this.processUserToken(data);
        },
        error => {
          console.log(error);
        },
        () => {
          this.getPersonalConnect();
        });

  }

  getPersonalConnect() {
    const url = 'https://transfer.api.globusonline.org/v0.10/endpoint_search?filter_scope=my-gcp-endpoints';
    this.globusService
      .getGlobus(url,  'Bearer ' + this.userAccessToken)
      .subscribe(
        data => {
          console.log('Data ');
          console.log(data);
          this.processPersonalConnect(data);
        },
        error => {
          console.log(error);
        },
        () => {
          this.findDirectories();
        });
  }

  findDirectories() {
    const url = 'https://transfer.api.globusonline.org/v0.10/operation/endpoint/' + this.selectedEndPont.id + '/ls';
    this.globusService
      .getGlobus(url,  'Bearer ' + this.userAccessToken)
      .subscribe(
        data => {
          console.log('Data ');
          console.log(data);
          this.processDirectories(data);
        },
        error => {
          console.log(error);
        },
        () => {
        });
  }

  processDirectories(data) {
    this.personalDirectories = new Array<object>();
    for (const obj of data.DATA) {
      if (obj.type === 'dir') {
        this.personalDirectories.push(obj);
      }
    }
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
  }

  getCode() {
    const scope = encodeURI('openid+email+profile+urn:globus:auth:scope:transfer.api.globus.org:all');
    const client_id = this.config.globusClientId;
    let new_url =  'https://auth.globus.org/v2/oauth2/authorize?client_id=' + client_id + '&response_type=code&' +
      'scope=' + scope;
    new_url = new_url + '&redirect_uri=' + this.config.redirectURL ;

    const myWindows = window.location.replace(new_url);
  }

  getClientToken() {
    const url = 'https://auth.globus.org/v2/oauth2/token?scope=openid+email+profile+urn:globus:auth:scope:transfer.api.globus.org:all&grant_type=client_credentials';

    const key = 'Basic ' + this.config.basicGlobusToken;
    this.globusService
      .postGlobus(url,  '', key)
      .subscribe(
        data => {
          console.log('Data ');
          console.log(data);
          this.clientToken = data['other_tokens'][0].access_token;
        },
        error => {
          console.log(error);
        },
        () => {
          this.submitTransfer();
        });

  }

  submitTransfer() {
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
  }

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
        destination_path :  '/10.5072/FK2/8KMCMQ/' + this.listOfAllStorageIdentifiers[i],
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

  onSubmitTransfer() {
    console.log('Submitting');
    this.getClientToken();
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
    if (typeof this.selectedDirectory !== 'undefined'  && typeof this.selectedDirectory !== 'undefined') {
      return true;
    } else {
      return false;
    }
  }
}
