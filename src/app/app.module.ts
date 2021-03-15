import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';

import { MatomoModule } from 'ngx-matomo';
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
import {MatTabsModule} from '@angular/material/tabs';
import { PersonalConnectComponent } from './personal-connect/personal-connect.component';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { RecentlyViewedComponentComponent } from './recently-viewed-component/recently-viewed-component.component';
import { SearchEndpointComponent } from './search-endpoint/search-endpoint.component';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { NavigateDirectoriesComponent } from './navigate-directories/navigate-directories.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NavigateTemplateComponent } from './navigate-template/navigate-template.component';
import {TranslateLoader, TranslateModule, TranslateParser, TranslateService} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { DownloadComponent } from './download/download.component';
import { UploadComponent } from './upload/upload.component';
import {RouterModule} from '@angular/router';
import { PersonalConnectDownloadComponent } from './personal-connect-download/personal-connect-download.component';
import { NavigateTemplateDownloadComponent } from './navigate-template-download/navigate-template-download.component';
import {MatTreeModule} from '@angular/material/tree';
import {MatCardModule} from '@angular/material/card';
import { SelectDirectoryComponent } from './select-directory/select-directory.component';

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
            config.basicGlobusToken = x.basicGlobusToken;
            config.globusClientId = x.globusClientId;
            config.globusEndpoint = x.globusEndpoint;
            config.bucket = x.bucket;
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
  ],
    imports: [
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot([
            {path: 'download', component: DownloadComponent},
            {path: 'upload', component: UploadComponent},
        ]),
        NoopAnimationsModule,
        MatSelectModule,
        MatomoModule,
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
    entryComponents: [NavigateDirectoriesComponent],
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
