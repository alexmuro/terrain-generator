const express = require('express')
const fs = require('fs')
const { exec } = require('child_process');
const app = express()
const mkdirp =require('mkdirp')
const tileDir = 'ibin/tiles'

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
	var tilesPerSide = Math.pow(2,z)
	
	//calculate longitudinal center
	var lonDegPerTile = (360 / tilesPerSide)
	var lonCenter = (lonDegPerTile * x) + (lonDegPerTile/2) - 180
	var latCenter = 0
	var mag =  ((planetCircumfence) / cmPerTile) / (591657550.500000 / Math.pow(2,z))
	
	if(+z >= 1) {
		latCenter = tile2lat(+y,z)
	}
	
	// console.log('z,y,x,lonCenter,latCenter,mag', z, y, x, lonCenter, latCenter,mag)
	var contours = '';
	if (+z >= 3) {
		contours = 10
	}
	if (+z >= 8) {
		contours = 5
	}
	if (+z >= 12) {
		contours = 3
	}
	if (+z >= 16) {
		contours = 1
	}
	var tileCommand = `./planet \
		-T 0 25 -s .15465831 \
		-w 256 -h 256 -p m \
		-i -0.044 -S \
		-C ./Lefebvre2.col \
		-E${contours} \
		-c -c -c \
		-m ${mag} \
		-l ${lonCenter} \
		-L ${latCenter } | convert - ${fileDir}${y}.png`
	mkdirp(fileDir, function(err) {
    	if (err) {
    		return cb(err)
    	}
		exec(tileCommand, (err, stdout, stderr) => {
		  // console.log(`stdout: ${stdout}`);
		  // console.log(`stderr: ${stderr}`);
		  
		  if (err) {
		  	//planet run error
		    return cb(err);
		  }
		  //planet ran successfully
		  return cb()
		  
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
	var n=Math.PI-2*Math.PI*(y + 0.5)/Math.pow(2,z);
    return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
}

