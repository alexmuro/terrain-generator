const express = require('express')
const fs = require('fs')
const { exec } = require('child_process');
const app = express()
const mkdirp =require('mkdirp')
const tileDir = 'ibin/tiles'
const scalingFactors = {
	19 :  1128.497220,
	18 :  2256.994440,
	17 :  4513.988880,
	16 :  9027.977761,
	15 :  18055.955520,
	14 :  36111.911040,
	13 :  72223.822090,
	12 :  144447.644200,
	11 :  288895.288400,
	10 :  577790.576700,
	9  :  1155581.153000,
	8  :  2311162.307000,
	7  :  4622324.614000,
	6  :  9244649.227000,
	5  :  18489298.450000,
	4  :  36978596.910000,
	3  :  73957193.820000,
	2  :  147914387.600000,
	1  :  295828775.300000,
	0  :  591657550.500000
}

app.get('/', (req, res) => res.send('Planet tile generator bellows hello.'))

app.get('/ibin/:z/:x/:y.png', (req, res) => {
	var x = req.params.x
	var y = req.params.y
	var z = req.params.z
	if( !x || !y || !z ){
		res.json({error: 'Must request z, y, x'})
	}
	var imgPath = `${__dirname}/${tileDir}/${z}/${x}/${y}.png`
	var imgDir = `${__dirname}/${tileDir}/${z}/${x}/`

	fs.stat(imgPath, function(err, stat) {
	    if(err == null) {
	    	//tile already generated, send from disk
	        return res.sendFile(imgPath)
	    } else if(err.code == 'ENOENT') {
	        // file does not exist
	        makeTile(imgDir, z, x , y, function(err){
	        	if(err) {
	        		//return res.json({error: err})
	        		//console.log('error', err)
	        	}
	        	res.sendFile(imgPath)
	        })
	       	
	    } else {
	        console.log('Some other error: ', err.code);
	        res.json({error: err.code})
	    }
	});
	//
	
	
})

function makeTile (fileDir, z, x, y, cb) {
	var planetCircumfence = 4.0075e9 
	var cmPerTile = 6.77
	var tilesPerSide = Math.sqrt(Math.pow(4,z))
	var lonDegPerTile = (360 / tilesPerSide)
	var lonCenter = (lonDegPerTile * x) + (lonDegPerTile/2) - 180
	var latApprox = (170 / tilesPerSide)
	var latMetersPerTile = (planetCircumfence / 2) / tilesPerSide
	var latDegPerTile = metersToLatLng([0,latMetersPerTile])[1] //(180 / tilesPerSide)
	console.log('latDegPerTile', latDegPerTile, (170 / tilesPerSide))
	var ySwitch = tilesPerSide - y - 1
	var nlatCenter = (latApprox * ySwitch) + (latDegPerTile/2) - 85
	var latCenter = nlatCenter
	
	metersToLatLng([0,latMetersPerTile])[1]
	//latCenter =
	//var latCenter =  180 / Math.PI * (2 * Math.atan( Math.exp( nlatCenter * Math.PI / 180.0)) - Math.PI / 2.0)
	var mag =  (planetCircumfence / cmPerTile) /  ( planetCircumfence / tilesPerSide) /// scalingFactors[z] ) 
	var LatWidth = (1/Math.cos(nlatCenter))
	var latMag =  ((planetCircumfence) / cmPerTile) / scalingFactors[z]
	console.log('scaling', z, scalingFactors[z] , ( planetCircumfence / tilesPerSide))
	console.log('mag',  mag, latMag, LatWidth)
	// var latLngCenter = centerFromTile(z, x, y)
	// divide 4x10^9 by the width of the map (in centimeters) and then by the
	// magnification factor
	console.log('z,y,x,lonCenter,latCenter,mag', z, ySwitch, x, lonCenter, latCenter)

	var tileCommand = `./planet \
		-T 0 25 -s .15465831 \
		-w 256 -h 256 -p m \
		-i -0.044 -S \
		-C ./Lefebvre2.col \
		-c -c -c \
		-m ${latMag} \
		-l ${lonCenter} \
		-L ${latCenter } | convert - ${fileDir}${y}.png`
	mkdirp(fileDir, function(err) {
    	if (err) {
    		return cb(err)
    	}
		exec(tileCommand, (err, stdout, stderr) => {
		  //console.log(`stdout: ${stdout}`);
		  //console.log(`stderr: ${stderr}`);
		  
		  if (err) {
		    // node couldn't execute the command
		    return cb(err);
		  }
		  return cb()
		  // the *entire* stdout and stderr (buffered)
		  
		});
	});
}

function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}

app.listen(3333, () => console.log('Planet tile generator listening on port 3333!'))

///-------------------Map Calculating things----------------------------------------

function centerFromTile(z,x,y) {
  var bounds = tileBounds(z,x,y);
    mins = metersToLatLng(bounds[0]);
    maxs = metersToLatLng(bounds[1]);
    console.log('yyy', mins,maxs, bounds[0], bounds[1])
    mins[0] +=180
    maxs[0] +=180
    mins[1] += 90
    maxs[1] += 90
       
    bounds = [ ((maxs[1] + mins[1]) / 2) - 90 , ((maxs[0] + mins[0]) /2) - 180 ]

    return bounds;
}

function metersToLatLng(coord) {
	var planetCircumfence = 4.0075e9 
  var lng = (coord[0] / (planetCircumfence / 2.0)) * 180.0
  console.log('coord1', coord[1])
  var lat = (coord[1] / (planetCircumfence / 2.0)) * 180.0
  var lat = 180 / Math.PI * (2 * Math.atan( Math.exp( lat * Math.PI / 180.0)) - Math.PI / 2.0)
  console.log('lat')
  return [lng,lat]
}


function tileBounds(z,x,y) {
  var mins = pixelsToMeters( z, x*256, (y+1)*256 )
  var maxs = pixelsToMeters( z, (x+1)*256, y*256 )
      
  return [mins,maxs];
}


function pixelsToMeters(z,x,y) {
  var res = (2 * Math.PI * 6378137 / 256) / (Math.pow(2,z));
  mx = x * res - (2 * Math.PI * 6378137 / 2.0);
  my = y * res - (2 * Math.PI * 6378137 / 2.0);
  my = -my;
  return [mx, my];
}