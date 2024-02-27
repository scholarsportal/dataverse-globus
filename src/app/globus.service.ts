import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { of, merge, from} from 'rxjs';
import { filter, flatMap} from 'rxjs/operators';
import {v4 as uuid } from 'uuid';
import {Permissions} from './interface/interface.component';

@Injectable()
export class GlobusService {

  userOtherAccessToken: string;
  userAccessToken: string;

  constructor(private http: HttpClient) {
  }

  getGlobus(url: string, key: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: key
      })
    };
    console.log('start');
    return this.http.get(url, httpOptions);
  }

  putGlobus(url: string, body: string, key: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/xml',
        'X-Dataverse-key': key
      })

    };
    return this.http.put(url, body, httpOptions);
    // return this.http.post(url,body, httpOptions);
  }

  deleteGlobus(url: string, key: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: key
      })
    };
    return this.http.delete(url,  httpOptions);
  }

  postGlobus(url: string, body: string, key: string) {
    console.log('Start posting Globus');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: key
      })

    };
    return this.http.post(url, body, httpOptions);
    // return this.http.post(url,body, httpOptions);
  }

  postDataverse(url: string, body: FormData, key: string) {
    console.log(url);
    console.log(body);
    console.log(key);
    let httpOptions = {};
    if (key !== 'null') {
      httpOptions = {
        // headers: new HttpHeaders({
        //  'Content-Type': 'application/json'
        // })
      };
    }
    return this.http.post(url, body, httpOptions);
  }
  postSimpleDataverse(url: string, body: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions);
  }
  getDataverse(url: string, key: string ) {
    let httpOptions = {};
    if (key !== 'null') {
      httpOptions = {
        // headers: new HttpHeaders({
        //  'X-Dataverse-key': key
        // })
      };
    }
    return this.http.get(url,  httpOptions);
  }

  getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) {
      return null;
    }
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  getClientToken(basicGlobusToken) {
    const url = 'https://auth.globus.org/v2/oauth2/token?scope=openid+email+profile+urn:globus:auth:scope:transfer.api.globus.org:all&grant_type=client_credentials';

    const key = 'Basic ' + basicGlobusToken;
    return this.postGlobus(url, '', key);
  }

  getUserInfo(userAccessToken) {
    const url = 'https://auth.globus.org/v2/oauth2/userinfo';
    console.log(userAccessToken);
    return this.getGlobus(url, 'Bearer ' + userAccessToken);
  }

  getPermission(clientToken, userIdentity, datasetDirectory, globusEndpoint, userPerm) {
    console.log('getting permissions!!!');
    console.log(userIdentity);
    console.log(clientToken);
    const url = 'https://transfer.api.globusonline.org/v0.10/endpoint/' + globusEndpoint + '/access';
    const key = 'Bearer ' + clientToken.other_tokens[0].access_token;
    console.log(key);
    const permissions: Permissions = {
      DATA_TYPE: 'access',
      principal_type: 'identity',
      principal: userIdentity.sub,
      path: datasetDirectory,
      permissions: userPerm
    };
    const stringPermissions = JSON.stringify(permissions);
    console.log(stringPermissions);
    return this.postGlobus(url, stringPermissions, key);
  }

  submitTransfer(userOtherAccessToken) {
    console.log('submitting transfer');
    const url = 'https://transfer.api.globusonline.org/v0.10/submission_id';
    return this.getGlobus(url, 'Bearer ' + userOtherAccessToken);
  }

  getInnerDirectories(directory, selectedEndPointId, userOtherAccessToken) {
    if (directory.DATA.length > 0) {
      const path = directory.path;
      console.log('Path');
      console.log(path);
      return merge(
          of(directory),
          from(directory.DATA)
              .pipe(filter(d => d['type'] === 'dir'))
              .pipe(flatMap(obj => this.getDirectory(path + obj['name'], selectedEndPointId, userOtherAccessToken)))
              .pipe(flatMap(d => this.getInnerDirectories(d, selectedEndPointId, userOtherAccessToken))));
    } else {
      return of(directory);
    }
  }

  getDirectory(path, selectedEndPointId, userOtherAccessToken) {
    console.log('start getDirectory');
    const url = 'https://transfer.api.globusonline.org/v0.10/operation/endpoint/' + selectedEndPointId +
        '/ls?path=' + path;
    return this
        .getGlobus(url, 'Bearer ' + userOtherAccessToken);
  }

  generateStorageIdentifier() {
    const identifier = uuid();
    console.log(identifier);

    // last 6 bytes, of the random UUID, in hex:

    const hexRandom = identifier.substring(24);
    console.log(hexRandom);
    const hexTimestamp = new Date().getTime().toString(16);
    console.log(hexTimestamp);
    const storageIdentifier = hexTimestamp + '-' + hexRandom;
    console.log(storageIdentifier);
    return storageIdentifier;
  }

  submitTransferItems(listOfAllFiles, paths, listOfAllStorageIdentifiersPaths,
                      submissionId, selectedEndPointId, globusEndpoint, userOtherAccessToken) {
    // console.log(paths);
    console.log('Starting submit transfer Item');
    console.log(submissionId);;
    const url = 'https://transfer.api.globusonline.org/v0.10/transfer';
    const taskItemsArray = new Array();

    for (let i = 0; i < listOfAllFiles.length; i++) {
      const storageId = listOfAllStorageIdentifiersPaths[i].substring(listOfAllStorageIdentifiersPaths[i].length - 24);
      const taskItem = {
        DATA_TYPE: 'transfer_item',
        source_path: listOfAllFiles[i],
        destination_path: paths[i],
        recursive: false
      };
      taskItemsArray.push(taskItem);
    }
    const body = {
      DATA_TYPE: 'transfer',
      DATA: taskItemsArray,
      submission_id: submissionId,
      notify_on_succeeded: false,
      notify_on_failed: false,
      source_endpoint: selectedEndPointId,
      destination_endpoint: globusEndpoint
    };
    const bodyString = JSON.stringify(body);
    console.log(bodyString);
    return this.postGlobus(url, bodyString, 'Bearer ' + userOtherAccessToken);
  }

  submitTransferToUser(listOfAllFiles, listOfAllPaths, submissionId, datasetDirectory, selectedDirectory, globusEndpoint, selectedEndpoint, userOtherAccessToken) {
    console.log('Starting submit transfer Item');
    console.log(submissionId);
    const url = 'https://transfer.api.globusonline.org/v0.10/transfer';
    const taskItemsArray = new Array();
    for (let i = 0; i < listOfAllFiles.length; i++) {
      console.log(listOfAllFiles[i]);
      const taskItem = {
        DATA_TYPE: 'transfer_item',
        source_path: datasetDirectory + listOfAllFiles[i].storageIdentifier,
        destination_path: selectedDirectory + listOfAllPaths[i] + listOfAllFiles[i].name,
        recursive: false
      };
      taskItemsArray.push(taskItem);
    }
    const body = {
      DATA_TYPE: 'transfer',
      DATA: taskItemsArray,
      submission_id: submissionId,
      notify_on_succeeded: true,
      notify_on_failed: true,
      source_endpoint: globusEndpoint,
      destination_endpoint: selectedEndpoint.id
    };
    const bodyString = JSON.stringify(body);
    console.log(bodyString);
    return this.postGlobus(url, bodyString, 'Bearer ' + userOtherAccessToken);
  }

  saveDirectories(dir, listOfAllFiles, listOfFileNames, listOfAllStorageIdentifiers) {
    console.log(dir);
    for (const obj of dir["DATA"]) {
      if (obj.type === 'file') {
        console.log(obj);
        if (dir["absolute_path"] == null || dir["absolute_path"] === 'null') {
          listOfAllFiles.push(dir["path"] + obj.name);
        } else {
          listOfAllFiles.push(dir["absolute_path"] + obj.name);
        }

        listOfFileNames.push(obj.name);
        listOfAllStorageIdentifiers.push(this.generateStorageIdentifier());
      }
    }
  }

  deleteRule(accessId, endpointId, clientToken) {
    const url = 'https://transfer.api.globusonline.org/v0.10/endpoint/' + endpointId + '/access/' + accessId;
    const key = 'Bearer ' + clientToken.other_tokens[0].access_token;
    return this.deleteGlobus(url, key);
  }

  ////////////////////////////////////////////////////////////////////////////////


}
