Planetside 2 Item Data Downloader
=================================

Scripts to download item data and item images from the Planetside2 API (census.soe.com)


Requirements
--------------

 - NodeJS - Get it here: http://nodejs.org/
 - Planetside 2 Service ID - Get it here: http://census.soe.com/

Installation
--------------

```sh
git clone git@github.com:mononz/Planetside2-Databases.git
cd Planetside2-Databases
npm install
```

Functions
-------------

 - Grabs items according to listed entries in items_vehicles.json and items_weapons.json

```sh
node getWeapons.js
```

 - Grab the entire repository of images from the archive

```sh
node getImageRepository.js
```