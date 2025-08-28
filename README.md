# m3ufilter

Serves as a proxy to an M3U server, such as an IPTV server. Downloads the M3U file from the server,
filters out groups and channels based on pre-setup configuration or on-demand URL attributes and
finally, returns the filtered M3U file back to the client.

## Install and run

> [!NOTE]  
> These steps use and require [Docker](https://docs.docker.com/engine/install). But you can just run the code if you have node installed (skip to "Build and run" if you wish to do that).

- Get the code:

```
git clone https://github.com/bluefoot/m3ufilter.git
```

- Create a docker image. For Linux, Mac or WSL, you can use the deploy.sh utility:

```
cd m3ufilter
sh deploy.sh
```

- **Optional**: copy `config.example.json` into a `config.json` file in any directory of your preference and edit it (see more details below).

- Start a container. You can use your preferred container manager, or run (replace `</path/to/directory/containing/configfile/>`):

```
docker run -d --restart unless-stopped -t -p 3000:3000 -v </path/to/directory/containing/configfile/>:/etc/m3ufilter m3ufilter:latest
```

This will start the app on port 3000.  You can access it via: http://localhost:3000/getm3u

## How to use

### Option 1: url call

Setup your player to call the `/getm3u` endpoint with the following query parameters:

- **url**: url of the m3u file.
- **groups** (optional): commma-separated list of groups to INCLUDE. Channels NOT belonging to groups in the list will be filtered out.
- **exclude** (optional): comma-seaprated list of keywords to EXCLUDE. Channels containing any of the keywords will be filtered out.

*Example*: http://localhost:3000/getm3u?url=http%3A%2F%2Fmym3userver%2Fget.php%3Fmykey%3Dkey&groups=Sports,Movies&exclude=F1

### Option 2: config file

- Copy `config.example.json` into a `config.json` file in any directory of your preference, and make sure that the directory is mounted as a docker volume (see installation steps above).

- In the file, you can setup one or more profiles. Each containing: m3u URL, groups to INCLUDE, groups to EXCLUDE.

- Setup your player to call the `/getm3u` endpoint with the **key** parameter pointing to a profile name in the configuration file.

*Example*: http://localhost:3000/getm3u?key=sports

### Bypassing filters and getting the full file

Just ommit both `groups` and `exclude` parameters from URL or config profile. The script will not apply any filters and return the full file from the server. Keep in mind that the script may still filter down some of the headers.

## Developer info

### Build and run (for development or quick tests)

Requirements: node and npm.

Run it once:

```npm install```

Then run this to build and run:

```npm run start```

When running like this, the app will look for a config file in the following locations, depending on the operating system:

- **windows**: %%USERDIR%%\AppData\LocalLow\m3ufilter\config.json
- **mac**: ~/Library/Preferences/m3ufilter/config.json
- **linux**: ~/.local/share/m3ufilter/config.json

### Test

```npm run test```

### Dependencies

- **axios**: To perform HTTP requests to download m3u playlist on server side
- **express**: HTTP Request/Response framework. Allows to create entrypoints and handlers

### Dev-only dependencies

- **typescript**: to support typescript under `src/`. Hooked up to the "build" hook (see package.json), with the config in tsconfig.json.
- **jest**: test runner and assertion lib
- **babel**: jest supports typescript via Babel. Babel transpiles typescript into javascript so jest can run tests written in typescript
- **types**: just the types for IDEs and compilation
- **prettier**: code format
- **node-mocks-http**: used to mock express request/response in controller handler tests

## Version history

### 1.0.1
- Switch to Docker
- Update libraries

### 1.0.0
- First version
