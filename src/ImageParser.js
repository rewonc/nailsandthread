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

ImageParser.prototype.imgPush = function() {
   this.domImage.src = this.src;
}
ImageParser.prototype.canvasPush = function(){
  this.domCanvas.width = this.image.width;
  this.domCanvas.height = this.image.height;
  this.context().drawImage(image,0,0);
}

ImageParser.prototype.pullDataMap = function() {
  return this.context.getImageData(0,0,this.domCanvas.width,this.domCanvas.height);
}

ImageParser.prototype.redrawCanvas = function(map){
  this.context().putImageData(map,0,0);
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
  console.log(arr);
  res['array'] = arr;
  return res;
}

ImageParser.prototype.grayToDataMap = function(grayscaleArray){
  //need to ensure at first that the new map and the old map are the same size
  //can do that later
  var arr;
  var imageMap = this.generateDataMap();
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
  console.log(imageMap);
  return imageMap;
}

