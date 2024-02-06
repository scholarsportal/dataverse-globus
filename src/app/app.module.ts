import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';

//import { MatomoModule } from 'ngx-matomo';
import { ConfigService } from './config.service';
import { of, Observable, ObservableInput } from '../../node_modules/rxjs';
import { map, catchError } from 'rxjs/operators';

import { AppComponent } from './app.component';
import { InterfaceComponent } from './interface/interface.component';
import {GlobusService} from './globus.service';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GlobusDirective } from './globus.directive';
import { UploadFileComponent } from './upload-file/upload-file.component';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import { PersonalConnectComponent } from './personal-connect/personal-connect.component';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatIconModule} from '@angular/material/icon';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {FormsModule} from '@angular/forms';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import { RecentlyViewedComponentComponent } from './recently-viewed-component/recently-viewed-component.component';
import { SearchEndpointComponent } from './search-endpoint/search-endpoint.component';
import {MatLegacyTableModule as MatTableModule} from '@angular/material/legacy-table';
import {MatLegacyPaginatorModule as MatPaginatorModule} from '@angular/material/legacy-paginator';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatLegacySnackBarModule as MatSnackBarModule} from '@angular/material/legacy-snack-bar';
import { NavigateDirectoriesComponent } from './navigate-directories/navigate-directories.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { NavigateTemplateComponent } from './navigate-template/navigate-template.component';
import {TranslateLoader, TranslateModule, TranslateParser, TranslateService} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { DownloadComponent } from './download/download.component';
import { UploadComponent } from './upload/upload.component';
import {RouterModule} from '@angular/router';
import { PersonalConnectDownloadComponent } from './personal-connect-download/personal-connect-download.component';
import { NavigateTemplateDownloadComponent } from './navigate-template-download/navigate-template-download.component';
import {MatTreeModule} from '@angular/material/tree';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import { SelectDirectoryComponent } from './select-directory/select-directory.component';
import { RecentlyViewedDownloadComponent } from './recently-viewed-download/recently-viewed-download.component';
import { DownloadFileComponent } from './download-file/download-file.component';
import { EndpointTemplateComponent } from './endpoint-template/endpoint-template.component';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

export function HttpLoaderFactory(httpClient: HttpClient) {
    return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

export function load(http: HttpClient, config: ConfigService): (() => Promise<boolean>) {
  return (): Promise<boolean> => {
    return new Promise<boolean>((resolve: (a: boolean) => void): void => {
      http.get('./assets/config.json')
        .pipe(
          map((x: ConfigService) => {
            config.baseUrl = x.baseUrl;
            console.log(config.baseUrl);
            config.id = x.id;
            config.redirectUploadURL = x.redirectUploadURL;
            config.redirectDownloadURL = x.redirectDownloadURL;
            config.redirectDownloadFileURL = x.redirectDownloadFileURL;
            config.basicGlobusToken = x.basicGlobusToken;
            config.globusClientId = x.globusClientId;
            config.globusEndpoint = x.globusEndpoint;
            config.includeBucketInPath = x.includeBucketInPath;
            config.apiToken = x.apiToken;
            resolve(true);
          }),
          catchError((x: { status: number }, caught: Observable<void>): ObservableInput<{}> => {
            console.log('error');
            if (x.status !== 404) {
              resolve(false);
            }
            config.baseUrl = '';
            config.id = -1;
            resolve(true);
            return of({});
          })
        ).subscribe();
    });
  };
}

@NgModule({
    declarations: [
        AppComponent,
        InterfaceComponent,
        GlobusDirective,
        UploadFileComponent,
        PersonalConnectComponent,
        RecentlyViewedComponentComponent,
        SearchEndpointComponent,
        NavigateDirectoriesComponent,
        NavigateTemplateComponent,
        DownloadComponent,
        UploadComponent,
        PersonalConnectDownloadComponent,
        NavigateTemplateDownloadComponent,
        SelectDirectoryComponent,
        RecentlyViewedDownloadComponent,
        DownloadFileComponent,
        EndpointTemplateComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot([
            { path: 'download', component: DownloadComponent },
            { path: 'upload', component: UploadComponent },
            { path: 'download-file', component: DownloadFileComponent }
        ], {}),
        NoopAnimationsModule,
        MatSelectModule,
        //MatomoModule,
        MatButtonModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        MatIconModule,
        MatGridListModule,
        MatTooltipModule,
        FormsModule,
        MatCheckboxModule,
        MatTableModule,
        MatPaginatorModule,
        MatToolbarModule,
        MatSnackBarModule,
        MatDialogModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        RouterModule,
        MatTreeModule,
        MatCardModule,
    ],
    providers: [GlobusService, {
            provide: APP_INITIALIZER,
            useFactory: load,
            deps: [
                HttpClient,
                ConfigService,
                TranslateService,
                TranslateParser
            ],
            multi: true
        }],
    bootstrap: [AppComponent]
})
export class AppModule { }
