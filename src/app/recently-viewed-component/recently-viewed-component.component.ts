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

  selectedEndPoint: any;
  recentlyViewedEndpoints: Array<object>;
  selectedDirectory: any;
  recentlyViewedDirectories: any;

  userOtherAccessToken: string;
  userAccessToken: string;
  clientToken: string;

  constructor(private globusService: GlobusService) { }

  @Input() userAccessTokenData: any;
  @Input() basicClientToken: string;
  @Input() datasetDirectory: string;
  @Input() globusEndpoint: string;
  @Input() datasetPid: string;
  @Input() key: string;
  @Input() siteUrl: string;

  ngOnInit(): void {
    console.log(this.userAccessTokenData);
    this.selectedDirectory = null;
  }

  ngOnChanges() {
    console.log(this.userAccessTokenData);
    if (typeof this.userAccessTokenData !== 'undefined') {
      this.getRecentlyViewedEndpoints(this.userAccessTokenData)
          .subscribe(
              data => this.processPersonalConnect(data),
              error => console.log(error),
              () => {
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
      this.selectedEndPoint = this.recentlyViewedEndpoints[0];
      if (this.selectedEndPoint.default_directory == null) {
        this.selectedDirectory = '~/';
      } else {
        this.selectedDirectory = this.selectedEndPoint.default_directory;
      }
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
    this.selectedEndPoint = event.value;
  }
}
