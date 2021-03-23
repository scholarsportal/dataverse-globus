import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {GlobusService} from '../globus.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TransferData} from '../upload/upload.component';

@Component({
  selector: 'app-recently-viewed-download',
  templateUrl: './recently-viewed-download.component.html',
  styleUrls: ['./recently-viewed-download.component.css']
})
export class RecentlyViewedDownloadComponent implements OnInit, OnChanges {

  constructor(private globusService: GlobusService,
              public snackBar: MatSnackBar) { }

  @Input() dataTransfer: TransferData;
  load: boolean;
  selectedEndPoint: any;
  recentlyViewedEndpoints: Array<object>;



  ngOnInit(): void {
    console.log("Starts init recently viewed");
    this.load = false;
    if (typeof this.dataTransfer.userAccessTokenData !== 'undefined') {
      this.getRecentlyViewedEndpoints(this.dataTransfer.userAccessTokenData)
          .subscribe(
              data => this.processPersonalConnect(data),
              error => {
                console.log(error),
                    this.load = true;
              },
              () => {
                this.load = true;
                console.log(this.recentlyViewedEndpoints);
              }
          );
    }
  }

  ngOnChanges() {
    this.load = false;
    if (typeof this.dataTransfer.userAccessTokenData !== 'undefined') {
      this.getRecentlyViewedEndpoints(this.dataTransfer.userAccessTokenData)
          .subscribe(
              data => this.processPersonalConnect(data),
              error => {
                console.log(error),
                    this.load = true;
              },
              () => {
                this.load = true;
                console.log(this.recentlyViewedEndpoints);
              }
          );
    }
  }

  getRecentlyViewedEndpoints(userAccessTokenData) {
    const url = 'https://transfer.api.globusonline.org/v0.10/endpoint_search?filter_scope=recently-used';
    console.log(userAccessTokenData);
    // this.userOtherAccessToken = userAccessTokenData.other_tokens[0].access_token;
    // this.userAccessToken = userAccessTokenData.access_token;
    return this.globusService
        .getGlobus(url, 'Bearer ' + this.dataTransfer.userAccessTokenData.other_tokens[0].access_token);
  }

  processPersonalConnect(data) {
    this.recentlyViewedEndpoints = new Array<object>();
    console.log(data);
    for (const obj of data.DATA) {
      this.recentlyViewedEndpoints.push(obj);

    }
    if (this.recentlyViewedEndpoints.length === 0) {
      console.log('Globus Connect Personal is not connected');
    } else {
      this.selectedEndPoint = this.recentlyViewedEndpoints[0];
    }

    console.log(this.recentlyViewedEndpoints);

  }

  recentlyViewedExist() {
    if (typeof this.recentlyViewedEndpoints !== 'undefined' && this.recentlyViewedEndpoints.length > 0) {
      console.log("returns true");
      return true;
    } else {
      return false;
    }
  }

  setSelectedEndpoint(event) {
    this.selectedEndPoint = event.value;
  }

}
