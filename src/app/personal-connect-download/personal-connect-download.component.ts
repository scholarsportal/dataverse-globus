import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {TransferData} from '../upload/upload.component';
import {GlobusService} from '../globus.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-personal-connect-download',
  templateUrl: './personal-connect-download.component.html',
  styleUrls: ['./personal-connect-download.component.css']
})
export class PersonalConnectDownloadComponent implements OnInit, OnChanges {

  constructor(private globusService: GlobusService,
              public snackBar: MatSnackBar) { }

  @Input() dataTransfer: TransferData;
  load: boolean;
  selectedEndPoint: any;
  personalConnectEndpoints: Array<object>;



  ngOnInit(): void {
    this.load = false;
  }

  ngOnChanges() {
    this.load = false;
    if (typeof this.dataTransfer.userAccessTokenData !== 'undefined') {
      this.getPersonalConnect(this.dataTransfer.userAccessTokenData)
          .subscribe(
              data => this.processPersonalConnect(data),
              error => {
                console.log(error),
                    this.load = true;
              },
              () => {
                this.load = true;
              }
          );
    }
  }

  getPersonalConnect(userAccessTokenData) {
    const url = 'https://transfer.api.globusonline.org/v0.10/endpoint_search?filter_scope=my-gcp-endpoints';

    const userOtherAccessToken = this.dataTransfer.userAccessTokenData.other_tokens[0].access_token;
    // this.userAccessToken = userAccessTokenData.access_token;
    return this.globusService
        .getGlobus(url, 'Bearer ' + userOtherAccessToken);
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
      console.log('Globus Connect Personal is not connected');
    } else {
      this.selectedEndPoint = this.personalConnectEndpoints[0];
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
