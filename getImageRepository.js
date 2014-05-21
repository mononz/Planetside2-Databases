var fs = require('fs');
var request = require('request');
var mkdirp = require('mkdirp');

// Grabs images with ids from 0 to 15,000.
var current = 0;
var last = 15000;

// URL for requesting images
var uri = 'https://census.soe.com/files/ps2/images/static/';

// Chain downloads images from the planetside api
function download(id) {
	var afterresp = request.post(uri + id).on('response', function () {
		if (afterresp.response.statusCode == 200) {
			console.log('Downloaded Image: ' + id + '');
			var filename = './out/imageRepo/' + id + '.png';
			afterresp.pipe(fs.createWriteStream(filename));
		}
		else {
			console.log('Bad image: ' + id + '');
		}
		if (current != last) {
			current++;
			download(current);
		}
		else {
			console.log('Done!');
		}
	});
}

// starts download

function initiate(filename) {
	mkdirp('./out', function (err) {
		if (err) console.error(err)
		else console.log('Created /out directory')
	});
	mkdirp('./out/imageRepo', function (err) {
		if (err) console.error(err)
		else console.log('Created /imageRepo directory')
	});
	console.log('Starting...');
	download(current);
}

initiate();