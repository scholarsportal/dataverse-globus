import {AfterViewInit, Component, Input, OnChanges, OnInit} from '@angular/core';
import {GlobusService} from '../globus.service';
import {MatLegacyTableDataSource as MatTableDataSource} from '@angular/material/legacy-table';

import { NavigateDirectoriesComponent } from '../navigate-directories/navigate-directories.component';
import {TransferData} from '../upload/upload.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';

export interface PassingDataType {
  dataTransfer: TransferData;
  data: any;
  action: boolean;
}

@Component({
  selector: 'app-search-endpoint',
  standalone: true,
  imports: [
    TranslateModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    MatIconModule,
    MatTableModule,
    MatInputModule
  ],
  templateUrl: './search-endpoint.component.html',
  styleUrls: ['./search-endpoint.component.css']
})
export class SearchEndpointComponent implements OnInit, AfterViewInit, OnChanges {

  public dialogRef: MatDialogRef<NavigateDirectoriesComponent>;
  value: string;
  @Input() dataTransfer: TransferData;
  @Input() action: boolean; // upload true, download false

  dataSource: MatTableDataSource<any>;
  displayedColumns: any;
  loaded;
  constructor(private globusService: GlobusService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.loaded = false;
    this.displayedColumns = ['display_name', 'owner_string', 'organization', 'department', 'description'];
    this.dataSource = new MatTableDataSource();
    this.loaded = false;
  }

  ngOnChanges() {
  }

  ngAfterViewInit() {
  }

  searchEndpoints(value) {
    this.loaded = false;

    if (typeof this.dataTransfer.userAccessTokenData !== 'undefined') {
      this.getEndpoints(this.dataTransfer.userAccessTokenData, value)
          .subscribe(
              data => {
                console.log(data);
                this.dataSource.data = data['DATA'];
                console.log(this.dataSource);
              },
                    error => console.log(error),
              () => {
                this.loaded = true;
              }
          );
    }
  }
  getEndpoints(userAccessTokenData, value) {
    const url = 'https://transfer.api.globusonline.org/v0.10/endpoint_search?filter_fulltext=' + value +
        '&filter_non_functional=0&limit=100&offset=0';
    console.log(url);
    console.log(userAccessTokenData);
    // this.userOtherAccessToken = userAccessTokenData.other_tokens[0].access_token;
    // this.userAccessToken = userAccessTokenData.access_token;
    return this.globusService
        .getGlobus(url, 'Bearer ' + this.dataTransfer.userAccessTokenData.other_tokens[0].access_token);
  }

  getDisplayedColumns() {
    let displayedColumns = []; // 'order_arrows'

    displayedColumns = [
      'display_name',
      'description',
        'owner_string',
        'organization'
    ];
    return displayedColumns;
  }

  ifExists() {
    return !!(typeof this.dataSource !== 'undefined' && this.loaded);
  }


  openDialog(data): void {
    const passingData: PassingDataType = {
      dataTransfer: this.dataTransfer,
      data,
      action: this.action
    };
    console.log('opening dialog');
    this.dialogRef = this.dialog.open(NavigateDirectoriesComponent, {
        data: passingData,
        // panelClass: 'field_width',
        width: '800px'
      });

  }

}
