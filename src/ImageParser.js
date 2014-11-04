var _; /*globals*/

//constructor 

function ImageParser(src) {
  this.src = src;
  this.image = new Image();
  this.image.src = src;
  this.drawer = new ImageDrawer();

  this.domLink = function(){
    this.domImage = document.getElementById('image');
    this.domCanvas = document.getElementById('canvas');
  }
  this.context = function(){
    return this.domCanvas.getContext("2d");
  }
}

ImageParser.prototype.initialize = function(){
    this.domLink();
    this.imgPush();
    this.canvasPush();
}

ImageParser.prototype.imgPush = function() {
   this.domImage.src = this.src;
}
ImageParser.prototype.canvasPush = function(){
  this.domCanvas.width = this.image.width;
  this.domCanvas.height = this.image.height;
  this.context().drawImage(image,0,0);
}

ImageParser.prototype.pullDataMap = function() {
  return this.context().getImageData(0,0,this.domCanvas.width,this.domCanvas.height);
}

ImageParser.prototype.pushToCanvas = function(map){
  this.context().putImageData(map,0,0);
}
ImageParser.prototype.ddataToDataMap = function(ddata){
  var arr;
  //generate a map from canvas
  var imageMap = this.pullDataMap();
  var data = imageMap.data;

  designateNodes(ddata);

  console.log(ddata);
  
  function designateNodes (ddata) {
    _.each(ddata.nodes, function(element, index, list) {
      ddata.pixels[element[0]] = -1;
    });
  }

  function gray16to256 (val) {
    if (val === -1 ) {
      return -1
    } else {
      return 16*val;
    }
  }

  if (imageMap.height === ddata.height && imageMap.width === ddata.width) {
    // 0 -> 3, 1 -> 7, 2 -> 11
    _.each(ddata.pixels, function(element, index, list){
      var a = (index * 4);
      var b = gray16to256(element);
      if (b > 0) {
        data[a] = b, data[a + 1] = b, data[a + 2] = b;
        data[a + 3] = 255;
      } else {
        data[a] = 255, data[a + 1] = 0, data[a + 2] = 0;
        data[a + 3] = 255;
      }
    });
  } else {
    imageMap['error'] = true
  }

  return imageMap;
}

ImageParser.prototype.pushNodesToCanvas = function(ddata) {
  var res;
  res = this.grayToDataMap(map);
  this.pushToCanvas(res);
  return res;
}

ImageParser.prototype.grayscaleArray = function(map) {
  var arr;
  var res = {
    width: map.width,
    height: map.height
  }
  function toGray16(r,g,b) {
    return Math.floor((r/255 * 0.2126 + g/255 * 0.7152 + b/255 * 0.0722)*16);
  }
  //translate 2244 unit array to 561 unit, based off calculation of each 4
  arr = _.reduce(map.data, function(memo, value, index, list){
    if ((index + 1) % 4 === 0){
      b = list[index - 1];
      g = list[index - 2];
      r = list[index - 3];
      gray = toGray16(r,g,b);
      //console.log(gray);
      memo[((index + 1)/4) - 1] = gray;
    }
    return memo;
  } , [] );
  res['array'] = arr;
  return res;
}

ImageParser.prototype.grayToDataMap = function(grayscaleArray){
  //need to ensure at first that the new map and the old map are the same size
  //can do that later
  var arr;
  //generate a map from canvas
  var imageMap = this.pullDataMap();
  var data = imageMap.data;
  function gray16to256 (val) {
    return 16*val;
  }

  if (imageMap.height === grayscaleArray.height && imageMap.width === grayscaleArray.width) {
    // 0 -> 3, 1 -> 7, 2 -> 11
    _.each(grayscaleArray.array, function(element, index, list){
      var a = (index * 4);
      var b = gray16to256(element);
      data[a] = b, data[a + 1] = b, data[a + 2] = b;
      data[a + 3] = 255;
    });
  } else {
    imageMap['error'] = true
  }
  return imageMap;
}

ImageParser.prototype.pullGray = function() {
  return this.grayscaleArray(this.pullDataMap());
}

ImageParser.prototype.pushGray = function(map) {
  var res;
  res = this.grayToDataMap(map);
  this.pushToCanvas(res);
  return res;
}

ImageParser.prototype.pushDrawData = function(ddata) {
  ddata.pixels = this.pullGray().array;
  ddata.nodes = [];
  ddata.lines = [];
  ddata.width = this.image.width;
  ddata.height = this.image.height;
  return ddata
}


