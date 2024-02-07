import { Component, OnInit } from '@angular/core';
import {ConfigService} from '../config.service';
import {TransferData} from '../upload/upload.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {InterfaceComponent} from '../interface/interface.component';
import {MatTabsModule} from '@angular/material/tabs';
import {SearchEndpointComponent} from '../search-endpoint/search-endpoint.component';
import {PersonalConnectDownloadComponent} from '../personal-connect-download/personal-connect-download.component';
import {RecentlyViewedDownloadComponent} from '../recently-viewed-download/recently-viewed-download.component';

@Component({
  selector: 'app-download',
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
    SearchEndpointComponent,
    PersonalConnectDownloadComponent,
    RecentlyViewedDownloadComponent
  ],
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css']
})
export class DownloadComponent implements OnInit {

  constructor(private config: ConfigService) { }
  redirectURL: string;
  dataTransfer: TransferData;
  action: boolean; // false for download

  ngOnInit(): void {
    this.redirectURL = this.config.redirectDownloadURL;
    this.dataTransfer = {} as TransferData;
    this.dataTransfer.load = false;
    this.action = false;
  }

  ifLoaded(dataTransfer: TransferData) {
    this.dataTransfer = dataTransfer;
  }

}
