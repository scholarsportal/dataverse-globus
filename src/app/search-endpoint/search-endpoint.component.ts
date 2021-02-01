import {AfterViewInit, Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {flatMap} from 'rxjs/operators';
import {GlobusService} from '../globus.service';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import { NavigateDirectoriesComponent } from '../navigate-directories/navigate-directories.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-search-endpoint',
  templateUrl: './search-endpoint.component.html',
  styleUrls: ['./search-endpoint.component.css']
})
export class SearchEndpointComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  public dialogRef: MatDialogRef<NavigateDirectoriesComponent>;
  value: string;
  userOtherAccessToken: string;
  userAccessToken: string;

  dataSource: MatTableDataSource<any>;
  displayedColumns: any;
  loaded;
  constructor(private globusService: GlobusService,
              public dialog: MatDialog) { }

  @Input() userAccessTokenData: any;
  @Input() basicClientToken: string;
  @Input() datasetDirectory: string;
  @Input() globusEndpoint: string;
  @Input() datasetPid: string;
  @Input() key: string;

   test = [{display_name: "name", owner_string: "owner", organization: "organization",
    department:"department", descriptioin:'description' },
     {display_name: "name", owner_string: "owner", organization: "organization",
       department:"department", descriptioin:'description' },
     {display_name: "name", owner_string: "owner", organization: "organization",
       department:"department", descriptioin:'description' },
     {display_name: "name", owner_string: "owner", organization: "organization",
       department:"department", descriptioin:'description' },
     {display_name: "name", owner_string: "owner", organization: "organization",
       department:"department", descriptioin:'description' },
     {display_name: "name", owner_string: "owner", organization: "organization",
       department:"department", description:'description' },
     {display_name: "name", owner_string: "owner", organization: "organization",
       department:"department", description:'description' }];

  ngOnInit(): void {
    this.loaded = false;
    this.displayedColumns = ['display_name', 'owner_string', 'organization', 'department', 'description'];
    this.dataSource = new MatTableDataSource(this.test);
    this.dataSource.paginator = this.paginator;
    console.log(this.paginator);
    this.loaded = false;
  }

  ngOnChanges() {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  searchEndpoints(value) {
    this.loaded = false;
    console.log(this.userAccessTokenData);
    if (typeof this.userAccessTokenData !== 'undefined') {
      this.getEndpoints(this.userAccessTokenData, value)
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
    this.userOtherAccessToken = userAccessTokenData.other_tokens[0].access_token;
    this.userAccessToken = userAccessTokenData.access_token;
    return this.globusService
        .getGlobus(url, 'Bearer ' + this.userOtherAccessToken);
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
      console.log(this.paginator);
      return true;
    } else {
      return false;
    }
  }

  getPageSizeOptions(): number[] {
    if (typeof this.dataSource !== 'undefined') {
      if (this.dataSource.paginator.length > 100) {
        return [25, 50, 100, this.dataSource.paginator.length];
      } else if (this.dataSource.paginator.length > 50 && this.dataSource.paginator.length < 100) {
        return [25, 50, this.dataSource.paginator.length];
      } else if (this.dataSource.paginator.length > 25 && this.dataSource.paginator.length < 50) {
        return [25, this.dataSource.paginator.length];
      } else if (this.dataSource.paginator.length >= 0 && this.dataSource.paginator.length < 25) {
        return [this.dataSource.paginator.length];
      } else {
        return [25, 50, 100];
      }
    } else {
      return [25];
    }

  }

  openDialog(data): void {
    this.dialogRef = this.dialog.open(NavigateDirectoriesComponent, {
      data: data,
      panelClass: 'field_width'
    });
  }

}
