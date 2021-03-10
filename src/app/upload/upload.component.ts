import { Component, OnInit } from '@angular/core';
import {ConfigService} from '../config.service';

export interface TransferData {
  load: boolean;
  userAccessTokenData: any;
  basicClientToken: string;
  datasetDirectory: string;
  globusEndpoint: string;
  datasetPid: string;
  datasetVersion: string;
  datasetId: string;
  key: string;
  siteUrl: string;
}

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  constructor(private config: ConfigService) { }
  redirectURL: string;
  dataTransfer: TransferData;


  ngOnInit(): void {
    this.redirectURL = this.config.redirectUploadURL;
    this.dataTransfer = {} as TransferData;
    this.dataTransfer.load = false;
  }

  ifLoaded(dataTransfer: TransferData) {
    this.dataTransfer = dataTransfer;
  }

}
