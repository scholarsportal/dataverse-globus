import {Component, Input, NgModule, OnChanges, OnInit, ElementRef, ViewChild, AfterViewInit, Renderer2, Output} from '@angular/core';
import {GlobusService} from '../globus.service';
import {catchError, filter, flatMap} from 'rxjs/operators';
import {v4 as uuid } from 'uuid';
import {forkJoin, from, merge, of, pipe, throwError} from 'rxjs';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import {TransferData} from '../upload/upload.component';


interface SelFilesType {
  fileNameObject: any;
  directory: string;
}


@Component({
  selector: 'app-personal-connect',
  templateUrl: './personal-connect.component.html',
  styleUrls: ['./personal-connect.component.css']
})
export class PersonalConnectComponent implements OnChanges, OnInit {

  constructor(private globusService: GlobusService,
              public snackBar: MatSnackBar) { }

  @Input() dataTransfer: TransferData;
  @Input() type: number // 0 - left, 1 - right, 2 - center
  load: boolean;
  selectedEndPoint: any;
  personalConnectEndpoints: Array<object>;

  ngOnInit(): void {
    this.load = false;
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

  ifLoaded(event) {
    this.personalConnectEndpoints = event;
    this.load = true;
  }

}
