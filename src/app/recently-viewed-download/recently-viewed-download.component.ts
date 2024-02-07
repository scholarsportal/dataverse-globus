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
  selector: 'app-recently-viewed-download',
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
  templateUrl: './recently-viewed-download.component.html',
  styleUrls: ['./recently-viewed-download.component.css']
})
export class RecentlyViewedDownloadComponent implements OnInit, OnChanges {

  constructor() { }

  @Input() dataTransfer: TransferData;
  @Input() type: number;
  load: boolean;
  selectedEndPoint: any;
  recentlyViewedEndpoints: Array<object>;


  ngOnInit(): void {
    this.load = false;
  }

  ngOnChanges() {
    this.load = false;
  }

  recentlyViewedExist() {
    if (typeof this.recentlyViewedEndpoints !== 'undefined' && this.recentlyViewedEndpoints.length > 0) {
      console.log('returns true');
      return true;
    } else {
      return false;
    }
  }

  setSelectedEndpoint(event) {
    this.selectedEndPoint = event;
  }
  ifLoaded(event) {
    this.recentlyViewedEndpoints = event;
    this.load = true;
  }
}
