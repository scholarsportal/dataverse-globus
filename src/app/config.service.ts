import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  baseUrl: string;
  id: number;
  redirectUploadURL: string;
  redirectDownloadURL: string;
  basicGlobusToken: string;
  globusClientId: string;
  globusEndpoint: string;
  bucket: string;
  constructor() { }
}
