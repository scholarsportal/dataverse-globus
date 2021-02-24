import { Component, OnInit } from '@angular/core';
import { GlobusService } from '../globus.service';
import {v4 as uuid } from 'uuid';
import {Observable, of, merge, from, forkJoin } from 'rxjs';
import {flatMap, map, tap, filter, concatMap} from 'rxjs/operators';
import {ConfigService} from '../config.service';
import {TranslateService} from '@ngx-translate/core';

export interface Permissions {
    DATA_TYPE: string;
    principal_type: string;
    principal: string;
    path: string;
    permissions: string;
}

@Component({
  selector: 'app-interface',
  templateUrl: './interface.component.html',
  styleUrls: ['./interface.component.css']
})
export class InterfaceComponent implements OnInit {

    translate: TranslateService;

  constructor(private globusService: GlobusService,
              private config: ConfigService,
              private translatePar: TranslateService) {

      this.translate = translatePar;
      this.translate.addLangs(['English', 'Français']);
      this.translate.setDefaultLang('English');

      const browserLang = this.translate.getBrowserLang();
      this.translate.use(browserLang.match(/English|Français/) ? browserLang : 'English');
  }
  title: string;

  userAccessToken: string;
  userToken: string;
  personalConnectEndpoints: Array<object>;
  selectedValue: string;
  selectedEndPont: any;
  personalDirectories: any;
  selectedDirectory: any;
  basicClientToken: string;
  submissionId: string;
  directoryContent: any;
  listOfAllFiles: Array<string>;
  listOfFileNames: Array<string>;
  listOfAllStorageIdentifiers: Array<string>;
  datasetPid: string;
  key: string;
  datasetDirectory: string;
  userIdentity: string;
  globusEndpoint: string;
  siteUrl: string;
  dvLocale: string;
  load: boolean;

  userAccessTokenData: any;

  ngOnInit(): void {
      this.load = false;
      this.title = 'Globus';

      this.datasetDirectory = null;
      this.basicClientToken = this.config.basicGlobusToken;
      this.globusEndpoint = this.config.globusEndpoint;
      const code = this.globusService.getParameterByName('code');
      console.log(code);
      if (code === null || code === '') {
          this.datasetPid = this.globusService.getParameterByName('datasetPid');
          this.key = this.globusService.getParameterByName('apiToken');
          console.log(this.key);
          this.siteUrl = this.globusService.getParameterByName('siteUrl');
          console.log(this.siteUrl);
          this.dvLocale = this.globusService.getParameterByName('dvLocale');
          this.setLanguage();
          const state = btoa(this.datasetPid + '_' + this.key + '_' + this.siteUrl + '_' + this.dvLocale); // encode
          this.getCode(state);
      } else {
          console.log(code);
          const state = this.globusService.getParameterByName('state');
          const decodedState = atob(state);
          console.log(decodedState);
          const parameters = decodedState.split('_');
          this.datasetPid = parameters[0];
          this.siteUrl = parameters[2];
          console.log(this.datasetPid);
          console.log(this.siteUrl);
          this.dvLocale = parameters[3];
          console.log(this.dvLocale);
          this.setLanguage();
          this.datasetDirectory = '/' + this.datasetPid.substring(this.datasetPid.indexOf(':') + 1) + '/';
          console.log(this.datasetPid);
          this.key = parameters[1];
          console.log(this.key);
       /*   this.getUserAccessToken(code)
              .pipe(flatMap(obj => this.getPersonalConnect(obj)))
              .pipe(flatMap(data => this.findDirectories(data)))
              .subscribe(
                  data => this.processDirectories(data),
                  error => console.log(error),
                  () => {}
              );*/
          this.getUserAccessToken(code);
      }
  }
  setLanguage() {

      if (this.dvLocale != null) {
          if (this.dvLocale === 'en') {
              this.translate.use('English');
          } else if (this.dvLocale === 'fr') {
              this.translate.use('Français');
          } else {
              const browserLang = this.translate.getBrowserLang();
              this.translate.use(browserLang.match(/English|Français/) ? browserLang : 'English');
          }
      } else {
          const browserLang = this.translate.getBrowserLang();
          this.translate.use(browserLang.match(/English|Français/) ? browserLang : 'English');
      }
  }

  getUserAccessToken(code) {
      console.log(code);
      const redirectURL = this.config.redirectURL;
      const url = 'https://auth.globus.org/v2/oauth2/token?code=' + code + '&redirect_uri=' + redirectURL + '&grant_type=authorization_code';
      console.log(url);
      const key = 'Basic ' + this.config.basicGlobusToken;
      return this.globusService.postGlobus(url,  '', key)
      /*----------------------*/
          .subscribe(
               data => {
                   console.log('Data ');
                   console.log(data);
                   this.userAccessTokenData = data;
               },
               error => {
                   console.log(error);
                   this.load = true;
               },
               () => {
                   this.load = true;
               });
  }

  getCode(state) {
    const scope = encodeURI('openid+email+profile+urn:globus:auth:scope:transfer.api.globus.org:all');
    const client_id = this.config.globusClientId;
    let new_url =  'https://auth.globus.org/v2/oauth2/authorize?client_id=' + client_id + '&response_type=code&' +
      'scope=' + scope + '&state=' + state;
    new_url = new_url + '&redirect_uri=' + this.config.redirectURL ;

    const myWindows = window.location.replace(new_url);
  }

  getClientToken() {
    const url = 'https://auth.globus.org/v2/oauth2/token?scope=openid+email+profile+urn:globus:auth:scope:transfer.api.globus.org:all&grant_type=client_credentials';

    const key = 'Basic ' + this.config.basicGlobusToken;
    this.globusService
      .postGlobus(url,  '', key);
  }
}
