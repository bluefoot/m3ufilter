# m3ufilter

Serves as a proxy to an M3U server, such as an IPTV server. Downloads the M3U file from the server,
filters out groups and channels based on pre-setup configuration or on-demand URL attributes and
finally, returns the filtered M3U file back to the client.

## Option 1: url call

Setup your M3U player to call the `/getm3u` endpoint with the following query parameters:

- **url**: url of the m3u file.
- **groups** (optional): commma-separated list of groups to INCLUDE. Channels NOT belonging to groups in the list will be filtered out.
- **exclude** (optional): comma-seaprated list of keywords to EXCLUDE. Channels containing any of the keywords will be filtered out.

*Example*: http://localhost:3000/getm3u?url=http%3A%2F%2Fmym3userver%2Fget.php%3Fmykey%3Dkey&groups=Sports,Movies&exclude=F1

## Option 2: config file

Setup your M3U player to call the `/getm3u` endpoint with the following query parameters:

- **key**: name of the profile in the configuration file

Copy `config.example.json` file to a `m3ufilter/config.json` file in the user data directory of your system and modify it.

The script will try to locate the config file in the following locations:

- **windows**: %%USERDIR%%\AppData\LocalLow\m3ufilter\config.json
- **mac**: ~/Library/Preferences/m3ufilter/config.json
- **linux**: ~/.local/share/m3ufilter/config.json

*Example*: http://localhost:3000/getm3u?key=sports

## Bypassing filters and getting the full file

Just ommit both `groups` and `exclude` from URL or config profile. The script will not apply any filters and return the full file from the server.

## Build and Run:

Run it once
` npm install`

Run it to build and run
`npm run start`

## How to create a Windows package:

1. Install `node` from nodejs.org (comes with `npm`)
1. Build with `npm run build`
1. Set aside the following directories/files: `dist`, `node_modules`, `package.json`
1. Using Bat To Exe Converter, create a bat with the following command: `npm run start > m3ufilter.log`
1. Save the .exe with Bat To Exe Converter
1. Send the new .exe file's shortcut to `shell:start` folder

## Test:

`npm run test`

## Dependencies:

- **axios**: To perform HTTP requests to download m3u playlist on server side
- **express**: HTTP Request/Response framework. Allows to create entrypoints and handlers

## Dev-only dependencies:

- **typescript**: to support typescript under `src/`. Hooked up to the "build" hook (see package.json), with the config in tsconfig.json.
- **jest**: test runner and assertion lib
- **babel**: jest supports typescript via Babel. Babel transpiles typescript into javascript so jest can run tests written in typescript
- **types**: just the types for IDEs and compilation
- **prettier**: code format
- **tslint**: check for code issues. Runs in the "prebuild" hook (see package.json), with the config in tslint.json. Currently disabled for being too annoying
- **node-mocks-http**: used to mock express request/response in controller handler tests

## Version history

### 1.0.0
- First version