import {Component, Input, NgModule, OnChanges, OnInit, ElementRef, ViewChild, AfterViewInit, Renderer2} from '@angular/core';
import {GlobusService} from '../globus.service';
import {catchError, filter, flatMap} from 'rxjs/operators';
import {v4 as uuid } from 'uuid';
import {forkJoin, from, merge, of, pipe, throwError} from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';


interface SelFilesType {
  fileNameObject: any;
  directory: string;
}


@Component({
  selector: 'app-personal-connect',
  templateUrl: './personal-connect.component.html',
  styleUrls: ['./personal-connect.component.css']
})
export class PersonalConnectComponent implements OnChanges, OnInit {


  selectedEndPoint: any;
  personalConnectEndpoints: Array<object>;
  personalDirectories: any;
  selectedDirectory: string;
  userOtherAccessToken: string;
  userAccessToken: string;
  clientToken: string;
  constructor(private globusService: GlobusService,
              public snackBar: MatSnackBar) { }

  @Input() userAccessTokenData: any;
  @Input() basicClientToken: string;
  @Input() datasetDirectory: string;
  @Input() globusEndpoint: string;
  @Input() datasetPid: string;
  @Input() key: string;
  @Input() siteUrl: string;


  ngOnInit(): void {
  }

  ngOnChanges() {

    if (typeof this.userAccessTokenData !== 'undefined') {
      console.log(this.userAccessTokenData);
      this.getPersonalConnect(this.userAccessTokenData)
          .subscribe(
              data => this.processPersonalConnect(data),
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
      this.selectedEndPoint = this.personalConnectEndpoints[0];
      if (this.selectedEndPoint.default_directory == null) {
        this.selectedDirectory = '~/';
      } else {
        this.selectedDirectory = this.selectedEndPoint.default_directory;
      }
    }

  }

  personalConnectExist() {
    if (typeof this.personalConnectEndpoints !== 'undefined' && this.personalConnectEndpoints.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  setSelectedEndpoint(event) {
    this.selectedEndPoint = event.value;
  }


}
