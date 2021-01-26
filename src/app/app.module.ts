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
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { RecentlyViewedComponentComponent } from './recently-viewed-component/recently-viewed-component.component';

export function load(http: HttpClient, config: ConfigService): (() => Promise<boolean>) {
  return (): Promise<boolean> => {
    return new Promise<boolean>((resolve: (a: boolean) => void): void => {
      http.get('./assets/config.json')
        .pipe(
          map((x: ConfigService) => {
            config.baseUrl = x.baseUrl;
            console.log(config.baseUrl);
            config.id = x.id;
            config.redirectURL = x.redirectURL;
            config.basicGlobusToken = x.basicGlobusToken;
            config.globusClientId = x.globusClientId;
            config.globusEndpoint = x.globusEndpoint;
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
  ],
    imports: [
        BrowserModule,
        HttpClientModule,
        NoopAnimationsModule,
        MatSelectModule,
        MatomoModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        MatIconModule,
        MatGridListModule,
        MatTooltipModule,
        FormsModule,
        MatCheckboxModule
    ],
  providers: [GlobusService, {
    provide: APP_INITIALIZER,
    useFactory: load,
    deps: [
      HttpClient,
      ConfigService
    ],
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
