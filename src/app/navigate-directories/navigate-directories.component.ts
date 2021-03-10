import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {flatMap} from 'rxjs/operators';
import {GlobusService} from '../globus.service';
import {of} from 'rxjs';
import {TransferData} from '../upload/upload.component';

@Component({
  selector: 'app-navigate-directories',
  templateUrl: './navigate-directories.component.html',
  styleUrls: ['./navigate-directories.component.css']
})



export class NavigateDirectoriesComponent implements OnInit {

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: any,
      public dialogRef: MatDialogRef<NavigateDirectoriesComponent>,
      private globusService: GlobusService
  ) { }

   selectedEndPoint: any;


  ngOnInit(): void {
    console.log(this.data);
  //  this.selectedEndPont = this.data;
    this.selectedEndPoint = this.data.data;
  }




}
