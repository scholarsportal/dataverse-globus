import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable()
export class GlobusService {

  constructor(private http: HttpClient) {
  }

  getGlobus(url: string, key: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: key
      })
    };
    return this.http.get(url, httpOptions);
  }

  putGlobus(url: string, body: string, key: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/xml',
        'X-Dataverse-key': key
      })

    };
    return this.http.put(url, body, httpOptions);
    // return this.http.post(url,body, httpOptions);
  }

  postGlobus(url: string, body: string,  key: string) {
    console.log("Start posting Globus");
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: key
      })

    };
    return this.http.post(url, body, httpOptions);
    // return this.http.post(url,body, httpOptions);
  }

  getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) {
      return null;
    }
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }




}
