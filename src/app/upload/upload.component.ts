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
  fileId: string;
  fileMetadataId: string;
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
  action: boolean; // true for upload


  ngOnInit(): void {
    this.redirectURL = this.config.redirectUploadURL;
    this.dataTransfer = {} as TransferData;
    this.dataTransfer.load = false;
    this.action = true;
  }

  ifLoaded(dataTransfer: TransferData) {
    this.dataTransfer = dataTransfer;
  }

}
