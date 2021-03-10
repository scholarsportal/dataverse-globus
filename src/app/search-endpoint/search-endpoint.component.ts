import {AfterViewInit, Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {flatMap} from 'rxjs/operators';
import {GlobusService} from '../globus.service';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import { NavigateDirectoriesComponent } from '../navigate-directories/navigate-directories.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TransferData} from '../upload/upload.component';

interface PassingDataType {
  dataTransfer: TransferData;
  data: any;
}

@Component({
  selector: 'app-search-endpoint',
  templateUrl: './search-endpoint.component.html',
  styleUrls: ['./search-endpoint.component.css']
})
export class SearchEndpointComponent implements OnInit, AfterViewInit, OnChanges {

  public dialogRef: MatDialogRef<NavigateDirectoriesComponent>;
  value: string;
  @Input() dataTransfer: TransferData;

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
    if (typeof this.dataSource !== 'undefined' && this.loaded) {
      return true;
    } else {
      return false;
    }
  }


  openDialog(data): void {
    const passingData: PassingDataType = {
      dataTransfer: this.dataTransfer,
      data
    };

    this.dialogRef = this.dialog.open(NavigateDirectoriesComponent, {
      data: passingData,
      //panelClass: 'field_width',
      width: '800px'
    });
  }

}
