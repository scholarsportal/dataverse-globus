import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {TransferData} from '../upload/upload.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {EndpointTemplateComponent} from '../endpoint-template/endpoint-template.component';
import {NavigateTemplateDownloadComponent} from '../navigate-template-download/navigate-template-download.component';

@Component({
  selector: 'app-personal-connect-download',
  standalone: true,
  imports: [
    TranslateModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    EndpointTemplateComponent,
    NavigateTemplateDownloadComponent
  ],
  templateUrl: './personal-connect-download.component.html',
  styleUrls: ['./personal-connect-download.component.css']
})
export class PersonalConnectDownloadComponent implements OnInit, OnChanges {

  constructor() { }

  @Input() dataTransfer: TransferData;
  @Input() type: number; // 0 - left, 1 - right, 2 - center
  load: boolean;
  selectedEndPoint: any;
  personalConnectEndpoints: Array<object>;
  selectedDirectory: string;

  ngOnInit(): void {
    this.load = false;
    console.log(this.type);
  }

  ngOnChanges() {
    this.load = false;
  }

  personalConnectExist() {
    return typeof this.personalConnectEndpoints !== 'undefined' && this.personalConnectEndpoints.length > 0;
  }

  setSelectedEndpoint(event) {
    this.selectedEndPoint = event;
  }

  setSelectedDirectory(event) {
    this.selectedDirectory = event;
  }

  ifLoaded(event) {
    this.personalConnectEndpoints = event;
    this.load = true;
  }

}
