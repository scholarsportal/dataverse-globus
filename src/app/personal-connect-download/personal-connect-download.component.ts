import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {TransferData} from '../upload/upload.component';
import {GlobusService} from '../globus.service';
import {MatLegacySnackBar as MatSnackBar} from '@angular/material/legacy-snack-bar';

@Component({
  selector: 'app-personal-connect-download',
  templateUrl: './personal-connect-download.component.html',
  styleUrls: ['./personal-connect-download.component.css']
})
export class PersonalConnectDownloadComponent implements OnInit, OnChanges {

  constructor(private globusService: GlobusService,
              public snackBar: MatSnackBar) { }

  @Input() dataTransfer: TransferData;
  @Input() type: number // 0 - left, 1 - right, 2 - center
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
    if (typeof this.personalConnectEndpoints !== 'undefined' && this.personalConnectEndpoints.length > 0) {
      return true;
    } else {
      return false;
    }
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
