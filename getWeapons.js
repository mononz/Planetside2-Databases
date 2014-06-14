var fs = require('fs');
var request = require('request');
var mkdirp = require('mkdirp');


// REQUEST URLS

// Replace 'example' with your own 'service id' (Get it from here: http://census.soe.com/)
var service_id = 'example';
// URL for requesting the full Planetside 2 weapons list. item_type_id=26 are weapons.
var uri_weap_list = 'http://census.soe.com/s:' + service_id + '/get/ps2/item/?item_type_id=26&c:limit=10000';
// URL for requesting item data
var uri = 'https://census.soe.com/s:' + service_id + '/get/ps2/item/';
// URL for requesting images
var uri_img = 'https://census.soe.com/files/ps2/images/static/';

// Array to hold all image ids which will be downloaded
var imageList = new Array();
// Pointer inside the array
var count = 0;

var dir = './out';
var dir_items = './out/items';
var dir_images = './out/images';


// FUNCTIONS

// Initiate search
function initiate() {
	count = 0;
	mkdirp(dir, function (err) {
		if (err) console.error(err)
		else console.log('Created /out directory')
	});
	mkdirp(dir_items, function (err) {
		if (err) console.error(err)
		else console.log('Created /items directory')
	});
	mkdirp(dir_images, function (err) {
		if (err) console.error(err)
		else console.log('Created /images directory')
	});
	req_weap_list();
}

// Grabs the weapon list from the planetside 2 api
function req_weap_list() {
	request(uri_weap_list, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			fs.writeFile(dir + '/weaponList.txt', body);
			console.log('Downloaded ' + 'weaponList.txt');
			var obj_weaps = JSON.parse(body);
			var item_weaps = obj_weaps['item_list'];
			for (i in item_weaps) {
				var itm_id = item_weaps[i]['item_id'];

				var filename = dir_items + '/' + itm_id + '.txt';
				fs.writeFileSync(filename, JSON.stringify(item_weaps[i]));
				console.log('Saved file: ' + itm_id);

				var img_id = item_weaps[i]['image_id'];
				imageList.push(img_id);
			}
			count = 0;
			console.log('Done');
			downloadImages(imageList[count]);
		}
		else {
			console.log('Bad List');
		}
	})
}

// Chain download images from imageList array
// Saving *****.png files to /images directory
function downloadImages(id) {
	var afterresp = request.post(uri_img + id).on('response', function () {
		if (afterresp.response.statusCode == 200) {
			console.log('Downloaded Image (' + count + '/'+ imageList.length + '): ' + id);
			var filename = dir_images + '/' + id + '.png';
			afterresp.pipe(fs.createWriteStream(filename));
		}
		else {
			console.log('Bad image: ' + id + '');
		}
		count++;
		if (count < imageList.length + 1) {
			downloadImages(imageList[count]);
		}
		else {
			console.log('FINISHED!!!');
		}
	});
}


// START SEARCH

initiate();

