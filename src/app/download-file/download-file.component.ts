import { Component, OnInit } from '@angular/core';
import {TransferData} from '../upload/upload.component';
import {ConfigService} from '../config.service';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {InterfaceComponent} from '../interface/interface.component';
import {MatTabsModule} from '@angular/material/tabs';
import {PersonalConnectDownloadComponent} from '../personal-connect-download/personal-connect-download.component';

@Component({
  selector: 'app-download-file',
  standalone: true,
  imports: [
    TranslateModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    InterfaceComponent,
    MatTabsModule,
    PersonalConnectDownloadComponent
  ],
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
