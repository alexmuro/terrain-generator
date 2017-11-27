var i = {
  x:1,
  y:1,
  z:1
}


console.log('Calculating bounding box for tile ' + i.z + '/' + i.x + '/' + i.y)


var output = boundsFromTile(i.z,i.x,i.y)

console.log('The bounding box is:');
console.log(output);

console.log('The center is:');
console.log(centerFromTile(i.z,i.x,i.y));
console.log('tile2Long', tile2long(i.x,i.z))
console.log('tile2Lat', tile2lat(3,2))


function tile2long(x,z) { return (x/Math.pow(2,z)*360-180); }

function tile2lat(y,z) {
    var n=Math.PI-2*Math.PI*(y)/Math.pow(2,z);
    var delta = n >= 0 ? 0.5 : -0.5
    n=Math.PI-2*Math.PI*(y-delta)/Math.pow(2,z);
    return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
}

function boundsFromTile(z,x,y) {
var bounds = tileBounds(z,x,y);
    mins = metersToLatLng(bounds[0]);
    maxs = metersToLatLng(bounds[1]);
    mins[0] +=180
    maxs[0] +=180
    mins[1] += 90
    maxs[1] += 90
       
       
    bounds={
      minLat:mins[1],
      maxLat:maxs[1],
      minLng:mins[0],
      maxLng:maxs[0]
    };

    return bounds;
}

function centerFromTile(z,x,y) {
  var bounds = tileBounds(z,x,y);
    mins = metersToLatLng(bounds[0]);
    maxs = metersToLatLng(bounds[1]);
    mins[0] +=180
    maxs[0] +=180
    mins[1] += 90
    maxs[1] += 90
       
    bounds = [ ((maxs[1] + mins[1]) / 2) - 90 , ((maxs[0] + mins[0]) /2) - 180 ]

    return bounds;
}

function metersToLatLng(coord) {
  var lng = (coord[0] / (2 * Math.PI * 6378137 / 2.0)) * 180.0
  
  var lat = (coord[1] / (2 * Math.PI * 6378137 / 2.0)) * 180.0
  var lat = 180 / Math.PI * (2 * Math.atan( Math.exp( lat * Math.PI / 180.0)) - Math.PI / 2.0)
  
  return [lng,lat]
}


function tileBounds(z,x,y) {
  var mins = pixelsToMeters( z, x*256, (y+1)*256 )
  var maxs = pixelsToMeters( z, (x+1)*256, y*256 )
      
  return [mins,maxs];
}


function pixelsToMeters(z,x,y) {
  var res = (2 * Math.PI * 6378137 / 256) / (Math.pow(2,z));
  var mx = x * res - (2 * Math.PI * 6378137 / 2.0);
  var my = y * res - (2 * Math.PI * 6378137 / 2.0);
  var my = -my;
  return [mx, my];
}