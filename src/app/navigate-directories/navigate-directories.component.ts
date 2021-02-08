import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {flatMap} from 'rxjs/operators';
import {GlobusService} from '../globus.service';
import {of} from 'rxjs';

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

   userAccessTokenData: any;
   basicClientToken: string;
   datasetDirectory: string;
   globusEndpoint: string;
   datasetPid: string;
   key: string;
   siteUrl: string;
   selectedEndPoint: any;


  ngOnInit(): void {
    console.log(this.data);
  //  this.selectedEndPont = this.data;
    this.userAccessTokenData = this.data.userAccessTokenData;
    this.basicClientToken = this.data.basicClientToken;
    this.datasetDirectory = this.data.datasetDirectory;
    this.globusEndpoint = this.data.globusEndpoint;
    this.datasetPid = this.data.datasetPid;
    this.key = this.data.key;
    this.siteUrl = this.data.siteUrl;
    this.selectedEndPoint = this.data.data;
  }




}
