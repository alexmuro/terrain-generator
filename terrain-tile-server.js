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
	
	//calculate longitudinal center
	var lonDegPerTile = (360 / tilesPerSide)
	var lonCenter = (lonDegPerTile * x) + (lonDegPerTile/2) - 180

	//calculate latitudinal center
	var latApprox = (170 / tilesPerSide)
	var latDegPerTile = (planetCircumfence / 2) / tilesPerSide
	//var latDegPerTile = metersToLatLng([0,latMetersPerTile])[1] //(180 / tilesPerSide)
	
	var ySwitch = tilesPerSide - y - 1
	var latCenter = (latApprox * ySwitch) + (latApprox/2) - 85
	
	
	// metersToLatLng([0,latMetersPerTile])[1]
	// latCenter =
	// var latCenter =  180 / Math.PI * (2 * Math.atan( Math.exp( nlatCenter * Math.PI / 180.0)) - Math.PI / 2.0)
	// var LatWidth = (1/Math.cos(nlatCenter))
	
	var mag =  ((planetCircumfence) / cmPerTile) / scalingFactors[z]
	if(+z >= 1) {
		// var delta = latCenter > 0 ? -0.5 : 0.5
		// console.log(z,y,delta,y-delta, latCenter)
		latCenter = tile2lat(y,z)
		//onsole.log(z,y,delta,y-delta, latCenter)

	}
	
	console.log('z,y,x,lonCenter,latCenter,mag', z, ySwitch, x, lonCenter, latCenter,mag)

	var tileCommand = `./planet \
		-T 0 25 -s .15465831 \
		-w 256 -h 256 -p m \
		-i -0.044 -S \
		-C ./Lefebvre2.col \
		-c -c -c \
		-m ${mag} \
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
function tile2lat(y,z) {
	var tilesPerSide = Math.sqrt(Math.pow(4,z))
    var n=Math.PI-2*Math.PI*(y)/Math.pow(2,z);
    console.log('y,z',y,z, y / tilesPerSide )
    var delta = n >= 0 || y / tilesPerSide > 0.51  ? -0.5 : 0.5
     console.log('y,z',y,z, y / tilesPerSide, delta, y-delta )
    n=Math.PI-2*Math.PI*(y-delta)/Math.pow(2,z);
    return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
}

// function tile2lat(y,z,delta) {
	
//     var n=Math.PI-2*Math.PI*(y-delta)/Math.pow(2,z);
//     var mult = delta > 0 ? -1 : 1
//     return mult * Math.abs(180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
   
// }