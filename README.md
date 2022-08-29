# dataverse-globus

_In development_.

A Dataverse tool for Globus integration to enable larger file uploads.

# Local Installation 

The Globus application should be registered in https://auth.globus.org/v2/web/developers and will get a clientId.
For development the Redirect URI in Globus registration should be http://localhost/*. Globus does not allow http, only https, except http://localhost and without a port.

In ``src/assets/config.json`` the following fields should be filled:

   *basicGlobusToken*  - Token of Globus application which is a base64 encoded client ID and client credential (secret), separated by a single colon
   
   *globusClientId*    - ClientId of registered Globus application
   
   *globusEndpoint*    - Globus endpoint (S3 storage)
   
   *bucket*            - name of bucket in S3 storage
   
   *apiToken*   - API token of Dataverse superuser. It is used for Dataverse API for deleting Globus rules

To run the dataverse-globus application one needs to install Angular 9 using node (version 16+) and npm (version 7+).

dataverse-globus was created using Angular CLI version 9.
In order to generate node_modules run `npm install` from a root of project directory .
Then run `npm install @angular/cli@9` to install `ng` and the rest of Angular CLI.
The executable `ng` must be in your `$PATH`. To add it, run `export PATH=$PATH:node_modules/.bin`.

For development purposes to run locally one can run dataverse-globus using...

`sudo ng serve --port 80`

...this is because Globus registration only allows for http://localhost/* for http.

It's normal for the home page of http://localhost to be blank but http://localhost/upload should show something.
