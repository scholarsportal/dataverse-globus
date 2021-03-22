import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {GlobusService} from '../globus.service';
import {catchError, flatMap} from 'rxjs/operators';
import {forkJoin, of, throwError} from 'rxjs';
import {TransferData} from '../upload/upload.component';

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

  @Input() dataTransfer: TransferData;
  load: boolean;
  selectedEndPoint: any;
  recentlyViewedEndpoints: Array<object>;
  recentlyViewedDirectories: any;

  constructor(private globusService: GlobusService) { }


  ngOnInit(): void {
    this.load = false;
  }

  ngOnChanges() {
    if (typeof this.dataTransfer.userAccessTokenData !== 'undefined') {
      this.getRecentlyViewedEndpoints(this.dataTransfer.userAccessTokenData)
          .subscribe(
              data => this.processPersonalConnect(data),
              error => {console.log(error); this.load = true; },
              () => {
                this.load = true;
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
