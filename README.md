# dataverse-globus-v2

_In development_.

A Dataverse tool for Globus integration to enable larger file uploads.

# Local Installation 

The Globus application should be registered as a portal to be used by dataverse in https://auth.globus.org/v2/web/developers and will get a clientId and secret.ClientId and secret will be used by dataverse.

The Globus application should be also registered as Native application (Thick client) and will get clientId but will be no secret, it will be used by this dataverse-globus app using PKCE authorization method. 

So there should be two registrations as a portal and as a thick client.

For development the Redirect URI in Globus registrations should be http://localhost, http://localhost/upload and http://localhost/download . Globus does not allow http, only https, except http://localhost and without a port.

In ``src/assets/config.json`` the following fields should be filled:

   *redirectUploadURL*    - For development, it should be http://localhist/upload
   
   *redirectDownloadURL*  - For development, it should be http://localhist/download
   
   *globusClientId*    - ClientId of registered Native (Thick client) Globus application
  
   
To run the dataverse-globus application one needs to install Angular 17.1.2 using node (version 18+) and npm (version 10+).

dataverse-globus was created using Angular CLI version 17.1.2
In order to generate node_modules run `npm install` from a root of project directory .
Then run `npm install @angular/cli@17.1.2` to install `ng` and the rest of Angular CLI.
The executable `ng` must be in your `$PATH`. To add it, run `export PATH=$PATH:node_modules/.bin`.

For development purposes to run locally one can run dataverse-globus using...

`sudo ng serve --port 80`

If sudo will not find ng try to run with
`sudo $(type -p ng) serve --port=80`

...this is because Globus registration only allows for http://localhost/* for http.

It's normal for the home page of http://localhost to be blank but http://localhost/upload should show something.

# Production Installation

The Globus application should be registered as a portal to be used by dataverse in https://auth.globus.org/v2/web/developers and will get a clientId and secret.ClientId and secret will be used by dataverse.

The Globus application should be also registered as Native application (Thick client) and will get clientId but will be no secret, it will be used by this dataverse-globus app using PKCE authorization method. 

So there should be two registrations as a portal and as a thick client.

For production Redirect URI in Globus registrations should be https://$SERVER, http://$SERVER/upload and https://$SERVER/download where $SERVER is URL of webserver of dataverse-globus app.

In ``src/assets/config.json`` the following fields should be filled:


   *redirectUploadURL*    - It should be https://$SERVER/upload, where $SERVER is URL of dataverse-globus app.
   
   
   *redirectDownloadURL*  - Itt should be https://$SERVER/download, where $SERVER is URL of dataverse-globus app.
   
   
   *globusClientId*    - ClientId of registered Native (Thick client) Globus application
  
   
To run the dataverse-globus application one needs to install Angular 17.1.2 using node (version 18+) and npm (version 10+).

dataverse-globus was created using Angular CLI version 17.1.2
In order to generate node_modules run `npm install` from a root of project directory .
Then run `npm install @angular/cli@17.1.2` to install `ng` and the rest of Angular CLI.
The executable `ng` must be in your `$PATH`. To add it, run `export PATH=$PATH:node_modules/.bin`.

To build run `ng build --base-href=path_to_globus_app`

You should have compiled source in dist directory. Copy dataverse-globus/dist into a dedicated folder on your webserver.

# Dataverse jvm-options

For dataverse-globus to work with Dataverse the following jvm options should be created:

## For S3 managed:

-Ddataverse.files.storage-driver-id=\<storage-alias\>

-Ddataverse.files.\<storage-alias\>.bucket-name=\<backet-name-in-S3\>

-Ddataverse.files.\<storage-alias\>.path-style-access=true

-Ddataverse.files.\<storage-alias\>.custom-endpoint-url=\<URL-of-S3\>

-Ddataverse.files.\<storage-alias\>.custom-endpoint-region=us-east-1

-Ddataverse.files.\<storage-alias\>.type=s3

-Ddataverse.files.\<storage-alias\>.label=\<Label-for-storage\>

-Ddataverse.files.\<storage-alias\>.transfer-endpoint-with-basepath=\<S3 endpoint\>

-Ddataverse.files.\<storage-alias\>.globus-transfer-endpoint-with-basepath=\<S3 endpoint\>

-Ddataverse.files.\<storage-alias\>.download-redirect=true

-Ddataverse.files.\<storage-alias\>.files-not-accessible-by-dataverse=false

-Ddataverse.files.\<storage-alias\>.managed=true

-Ddataverse.files.\<storage-alias\>.globus-token=\<Globus basic token\> It is base64 encoded client ID and secret, separated by a single colon.

-Ddataverse.files.\<storage-alias\>.upload-redirect=true

## For referenced endpoint:

-Ddataverse.files.storage-driver-id=\<storage-alias\>

-Ddataverse.files.\<storage-alias\>.type=globus

-Ddataverse.files.\<storage-alias\>.label=\<label\>

-Ddataverse.files.\<storage-alias\>.base-store=s3 

-Ddataverse.files.\<storage-alias\>.managed=false

-Ddataverse.files.\<storage-alias\>.files-not-accessible-by-dataverse=true

-Ddataverse.files.\<storage-alias\>.reference-endpoints-with-basepaths=\<List of globus and points separated by coma\>

-Ddataverse.files.\<storage-alias\>.globus-token=\<Globus basic token\> It is base64 encoded client ID and secret, separated by a single colon.

# Dataverse database settings
For Globus Upload and Globus Download buttons to appear on dataverse dataset page, one will need to add globus to :UploadMethods and :DownloadMethods. For example:

``curl -X PUT -d 'native/http,globus' http://localhost:8080/api/admin/settings/:UploadMethods``

``curl -X PUT -d 'native/http,globus' http://localhost:8080/api/admin/settings/:DownloadMethods``


