var fs = require('fs');
var request = require('request');
var mkdirp = require('mkdirp');


// REQUEST URLS

// Replace 'example' with your own 'service id' (Get it from here: http://census.soe.com/)
var service_id = 'example';
// URL for requesting the full Planetside 2 weapons list. item_type_id=26 are weapons.
var uri_weap_list = 'http://census.soe.com/s:' + service_id + '/get/ps2/item/?item_type_id=26&c:limit=10000';
var uri_vehicle_list = 'http://census.soe.com/s:' + service_id + '/get/ps2/vehicle/?&c:limit=200';
// URL for requesting item data
var uri = 'https://census.soe.com/s:' + service_id + '/get/ps2/item/';
// URL for requesting images
var uri_img = 'https://census.soe.com/files/ps2/images/static/';

// Array to hold all image ids which will be downloaded
var imageList = [];
var vehicleimageList = [];

var dir = './out';
var dir_items = './out/items_text';
var dir_images = './out/items_images';
var dir_vehicles = './out/items_vehicles';
var dir_images_vehicles = './out/items_images_vehicles';

var vehicle_count = 0;
var item_count = 0;


// FUNCTIONS

// Initiate search
function initiate() {
	count = 0;
	mkdirp(dir, function (err) {
		if (err) console.error(err);
		else console.log('Created /out directory');
	});
	mkdirp(dir_items, function (err) {
		if (err) console.error(err);
		else console.log('Created /items_text directory');
	});
	mkdirp(dir_images, function (err) {
		if (err) console.error(err);
		else console.log('Created /items_images directory');
	});
	mkdirp(dir_vehicles, function (err) {
		if (err) console.error(err);
		else console.log('Created /items_vehicles directory');
	});
	mkdirp(dir_images_vehicles, function (err) {
		if (err) console.error(err);
		else console.log('Created /items_images_vehicles directory');
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
			var item_weaps = obj_weaps.item_list;
			for (var i in item_weaps) {
				var itm_id = item_weaps[i].item_id;
				var filename = dir_items + '/' + itm_id + '.txt';
				fs.writeFileSync(filename, JSON.stringify(item_weaps[i]));
				try {
					var item_name = item_weaps[i].name.en;
					console.log('Saved Item: ' + item_name);
				} catch(err) {
					console.log('Saved Item: ' + itm_id);
				}

				var img_id = item_weaps[i].image_id;
				imageList.push(img_id);
			}
			console.log('Done');
			req_vehicle_list();
		}
		else {
			console.log('Bad List');
		}
	});
}


// Grabs the weapon list from the planetside 2 api
function req_vehicle_list() {
	request(uri_vehicle_list, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			fs.writeFile(dir + '/vehicleList.txt', body);
			console.log('Downloaded ' + 'vehicleList.txt');
			var obj_vehicles = JSON.parse(body);
			var item_vehs = obj_vehicles.vehicle_list;
			for (var i in item_vehs) {
				var veh_id = item_vehs[i].vehicle_id;
				var veh_name = item_vehs[i].name.en;
				var filename = dir_vehicles + '/' + veh_id + '.txt';
				fs.writeFileSync(filename, JSON.stringify(item_vehs[i]));
				console.log('Saved Vehicle: ' + veh_name);

				var img_id = item_vehs[i].image_id;
				vehicleimageList.push(img_id);
			}
			console.log('Done');
			downloadVehicleImages(vehicleimageList[0]);
		}
		else {
			console.log('Bad List');
		}
	});
}

// Chain download vehicle images from vehicleimageList array
function downloadVehicleImages(id) {
	var afterresp = request.post(uri_img + id).on('response', function () {
		if (afterresp.response.statusCode == 200) {
			var got = vehicle_count+1;
			console.log('Downloaded Vehicle Image (' + got + '/'+ vehicleimageList.length + '): ' + id);
			var filename = dir_images_vehicles + '/' + id + '.png';
			afterresp.pipe(fs.createWriteStream(filename));
		}
		else {
			console.log('Bad image: ' + id + '');
		}
		vehicle_count++;
		if (vehicle_count < vehicleimageList.length) {
			downloadVehicleImages(vehicleimageList[vehicle_count]);
		}
		else {
			console.log('Done');
			downloadImages(imageList[0]);
		}
	});
}

// Chain download images from imageList array
// Saving *****.png files to /images directory
function downloadImages(id) {
	var afterresp = request.post(uri_img + id).on('response', function () {
		if (afterresp.response.statusCode == 200) {
			var got = item_count+1;
			console.log('Downloaded Image (' + got + '/'+ imageList.length + '): ' + id);
			var filename = dir_images + '/' + id + '.png';
			afterresp.pipe(fs.createWriteStream(filename));
		}
		else {
			console.log('Bad image: ' + id + '');
		}
		item_count++;
		if (item_count < imageList.length) {
			downloadImages(imageList[item_count]);
		}
		else {
			console.log('FINISHED!!!');
		}
	});
}


// START SEARCH

initiate();
