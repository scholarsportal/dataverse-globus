import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {GlobusService} from '../globus.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TransferData} from '../upload/upload.component';

@Component({
  selector: 'app-recently-viewed-download',
  templateUrl: './recently-viewed-download.component.html',
  styleUrls: ['./recently-viewed-download.component.css']
})
export class RecentlyViewedDownloadComponent implements OnInit, OnChanges {

  constructor(private globusService: GlobusService,
              public snackBar: MatSnackBar) { }

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
      console.log("returns true");
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
