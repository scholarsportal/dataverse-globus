import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {GlobusService} from '../globus.service';
import {TransferData} from '../upload/upload.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {EndpointTemplateComponent} from '../endpoint-template/endpoint-template.component';
import {NavigateTemplateComponent} from '../navigate-template/navigate-template.component';

interface SelFilesType {
  fileNameObject: any;
  directory: string;
}

@Component({
  selector: 'app-recently-viewed-component',
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
    NavigateTemplateComponent
  ],
  templateUrl: './recently-viewed-component.component.html',
  styleUrls: ['./recently-viewed-component.component.css']
})
export class RecentlyViewedComponentComponent implements OnChanges, OnInit {

  @Input() dataTransfer: TransferData;
  load: boolean;
  selectedEndPoint: any;
  recentlyViewedEndpoints: Array<object>;

  constructor(private globusService: GlobusService) { }


  ngOnInit(): void {
    this.load = false;
  }

  ngOnChanges() {
    this.load = false;
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
    return typeof this.recentlyViewedEndpoints !== 'undefined' && this.recentlyViewedEndpoints.length > 0;
  }

  setSelectedEndpoint(event) {
    this.selectedEndPoint = event;
  }

  ifLoaded(event) {
    this.recentlyViewedEndpoints = event;
    this.load = true;
  }


}
