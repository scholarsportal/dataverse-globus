import { Component, OnInit } from '@angular/core';
import {ConfigService} from '../config.service';
import {TransferData} from '../upload/upload.component';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css']
})
export class DownloadComponent implements OnInit {

  constructor(private config: ConfigService) { }
  redirectURL: string;
  dataTransfer: TransferData;

  ngOnInit(): void {
    this.redirectURL = this.config.redirectDownloadURL;
    this.dataTransfer = {} as TransferData;
    this.dataTransfer.load = false;
  }

  ifLoaded(dataTransfer: TransferData) {
    this.dataTransfer = dataTransfer;
  }

}
