import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { GlobusService } from '../globus.service';
import {v4 as uuid } from 'uuid';
import {Observable, of, merge, from, forkJoin } from 'rxjs';
import {flatMap, map, tap, filter, concatMap} from 'rxjs/operators';
import {ConfigService} from '../config.service';
import {TranslateService} from '@ngx-translate/core';
import {TransferData} from '../upload/upload.component';

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
    @Input() redirectURL: string;
    @Output() newItemEvent = new EventEmitter<TransferData>();
    transferData: TransferData;

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
  dvLocale: string;

  ngOnInit(): void {
        this.transferData = {} as TransferData;
        this.transferData.load = false;
        this.title = 'Globus';
        console.log(this.redirectURL);

        this.transferData.datasetDirectory = null;
        this.transferData.basicClientToken = this.config.basicGlobusToken;
        this.transferData.globusEndpoint = this.config.globusEndpoint;
        const code = this.globusService.getParameterByName('code');
        console.log(code);
        if (code === null || code === '') {
            this.transferData.datasetPid = this.globusService.getParameterByName('datasetPid');
            this.transferData.key = this.globusService.getParameterByName('apiToken');
            this.transferData.siteUrl = this.globusService.getParameterByName('siteUrl');
            this.transferData.datasetId = this.globusService.getParameterByName('datasetId');
            this.transferData.datasetVersion = this.globusService.getParameterByName('datasetVersion');
            this.dvLocale = this.globusService.getParameterByName('dvLocale');
            this.setLanguage();
            const state = btoa(this.transferData.datasetPid + '_'
                + this.transferData.key + '_'
                + this.transferData.siteUrl + '_'
                + this.transferData.datasetId + '_'
                + this.transferData.datasetVersion + '_'
                + this.dvLocale); // encode
            this.getCode(state);
        } else {
            console.log(code);
            const state = this.globusService.getParameterByName('state');
            const decodedState = atob(state);
            console.log(decodedState);
            const parameters = decodedState.split('_');
            this.transferData.datasetPid = parameters[0];
            this.transferData.siteUrl = parameters[2];
            console.log(this.transferData.datasetPid);
            console.log(this.transferData.siteUrl);
            this.transferData.datasetId = parameters[3];
            this.transferData.datasetVersion = parameters[4];
            console.log(this.transferData.datasetId);
            console.log(this.transferData.datasetVersion);
            this.dvLocale = parameters[5];
            console.log(this.dvLocale);
            this.setLanguage();
            this.transferData.datasetDirectory = '/' + this.transferData.datasetPid.substring(this.transferData.datasetPid.indexOf(':') + 1) + '/';
            this.transferData.key = parameters[1];
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
        const url = 'https://auth.globus.org/v2/oauth2/token?code=' + code + '&redirect_uri=' + this.redirectURL + '&grant_type=authorization_code';
        console.log(url);
        const key = 'Basic ' + this.config.basicGlobusToken;
        return this.globusService.postGlobus(url,  '', key)
            /*----------------------*/
            .subscribe(
                data => {
                    console.log('Data ');
                    console.log(data);
                    this.transferData.userAccessTokenData = data;
                },
                error => {
                    console.log(error);
                    this.transferData.load = true;
                    this.newItemEvent.emit(this.transferData);
                },
                () => {
                    this.transferData.load = true;
                    this.newItemEvent.emit(this.transferData);
                });
    }

    getCode(state) {
        const scope = encodeURI('openid+email+profile+urn:globus:auth:scope:transfer.api.globus.org:all');
        const client_id = this.config.globusClientId;
        console.log(this.config.redirectUploadURL);
        let new_url =  'https://auth.globus.org/v2/oauth2/authorize?client_id=' + client_id + '&response_type=code&' +
            'scope=' + scope + '&state=' + state;
        new_url = new_url + '&redirect_uri=' + this.redirectURL ;

        const myWindows = window.location.replace(new_url);
    }
}
