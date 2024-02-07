import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

// import { MatomoModule } from 'ngx-matomo';
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
import { PersonalConnectComponent } from './personal-connect/personal-connect.component';
import { ReactiveFormsModule} from '@angular/forms';
import { RecentlyViewedComponentComponent } from './recently-viewed-component/recently-viewed-component.component';
import { SearchEndpointComponent } from './search-endpoint/search-endpoint.component';
import { NavigateDirectoriesComponent } from './navigate-directories/navigate-directories.component';
import { NavigateTemplateComponent } from './navigate-template/navigate-template.component';
import {TranslateLoader, TranslateModule, TranslateParser, TranslateService} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { DownloadComponent } from './download/download.component';
import { UploadComponent } from './upload/upload.component';
import {RouterModule} from '@angular/router';
import { PersonalConnectDownloadComponent } from './personal-connect-download/personal-connect-download.component';
import { NavigateTemplateDownloadComponent } from './navigate-template-download/navigate-template-download.component';
import {MatTreeModule} from '@angular/material/tree';
import { SelectDirectoryComponent } from './select-directory/select-directory.component';
import { RecentlyViewedDownloadComponent } from './recently-viewed-download/recently-viewed-download.component';
import { DownloadFileComponent } from './download-file/download-file.component';
import { EndpointTemplateComponent } from './endpoint-template/endpoint-template.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';

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
        GlobusDirective
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot([
            {path: 'download', component: DownloadComponent},
            {path: 'upload', component: UploadComponent},
            {path: 'download-file', component: DownloadFileComponent}
        ], {}),
        NoopAnimationsModule,
        // MatomoModule,
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
        ReactiveFormsModule,
        InterfaceComponent,
        EndpointTemplateComponent,
        NavigateDirectoriesComponent,
        SearchEndpointComponent,
        NavigateTemplateComponent,
        UploadComponent,
        NavigateTemplateDownloadComponent,
        SelectDirectoryComponent,
        MatTabsModule,
        UploadFileComponent,
        PersonalConnectComponent,
        RecentlyViewedComponentComponent,
        DownloadComponent,
        PersonalConnectDownloadComponent,
        RecentlyViewedDownloadComponent,
        DownloadFileComponent,
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
    exports: [
        NavigateTemplateComponent,
        NavigateTemplateDownloadComponent,
        PersonalConnectComponent,
        RecentlyViewedComponentComponent,
        PersonalConnectDownloadComponent,
        RecentlyViewedDownloadComponent,
        GlobusDirective
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
