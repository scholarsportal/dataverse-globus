# globus

_In development_.

A Dataverse external tool for globus integration to enable larger file uploads.
# Local Installation 

To register dataverse-globus in dataverse (local)

`curl -X POST -H 'Content-type: application/json' --upload-file globus_upload.json http://localhost:8080/api/admin/externalTools` - for upload tool.

`curl -X POST -H 'Content-type: application/json' --upload-file globus_download.json http://localhost:8080/api/admin/externalTools` - for download tool.

where toolUrl should be the url of globus application. To run it on local machine one can use http://localhost/upload.

Globus application should be registered in https://auth.globus.org/v2/web/developers It will get clientId.
For development Redirect URI in globus registration should be http://localhost/*. Globus does not allow http, only htpps, except http://localhost and without port.

In ``src/assets/config.json`` the following fields should be filled:

   *basicGlobusToken*  - Token of globus application which is  base64 encoded client ID and client credential (secret), separated by a single colon.
   
   *globusClientId*    - ClientId of registered globus application 
   
   *globusEndpoint*    - Globus endpoint (S3 storage)
   
   *bucket*            - name of bucket in S3 storage
   
   *apiToken*   - API token of Dataverse superuser. It is used for dataverse api for deleting Globus rules.

To run dataverse-globus application one needs to install angular 9 using node (version 16+) and npm (version 7+).

dataverse-globus was created using Angular CLI version 9.
In order to generate node_modules run `npm install` from a root of project directory .
Then run `npm install @angular/cli@9` to install `ng` and the rest of Angular CLI.
The executable `ng` must be in your `$PATH`. To add it, run `export PATH=$PATH:node_modules/.bin`.

For development purposes to run locally one can run dataverse-globus using

`sudo ng serve --port 80`

(It's normal for the home page of http://localhost to be blank.)

this is because globus registration only allows for http://localhost/* for http.



