var fs = require('fs');
var geocoder = require('simple-geocoder');
var rawStations = fs.readFileSync('data/lines.json','UTF-8');
rawStations = JSON.parse(rawStations);
fs.writeFileSync('data/processed-lines.json',JSON.stringify(rawStations,null,4));
