import { Component, OnInit } from '@angular/core';
import {TransferData} from '../upload/upload.component';
import {ConfigService} from '../config.service';

@Component({
  selector: 'app-download-file',
  templateUrl: './download-file.component.html',
  styleUrls: ['./download-file.component.css']
})
export class DownloadFileComponent implements OnInit {

  redirectURL: string;
  dataTransfer: TransferData;
  action: boolean; // false for download
  type: number;

  constructor(private config: ConfigService) { }

  ngOnInit(): void {
    this.redirectURL = this.config.redirectDownloadFileURL;
    console.log(this.redirectURL);
    this.dataTransfer = {} as TransferData;
    this.dataTransfer.load = false;
    this.action = false;
    this.type = 2;
  }

  ifLoaded(dataTransfer: TransferData) {
    this.dataTransfer = dataTransfer;
  }

}
