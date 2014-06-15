var _; /*globals*/

function ImageParser(src) {
  this.src = src;
  var image = new Image();
  image.src = this.src;
}

//need to refactor these fxns to be less confused and only do 1 task

ImageParser.prototype.generateDataMap = function() {
  var canvas = document.getElementById('canvas');
  var dataMap = canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height);
  return dataMap; 
}
ImageParser.prototype.refreshPage = function() {
   var img;
   img = document.getElementById('image');
   img.src = this.src;
}
ImageParser.prototype.returnImage = function(){
  return image;
}
ImageParser.prototype.drawCanvas = function(){
  var canvas = document.getElementById('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  ctx = canvas.getContext("2d");
  ctx.drawImage(image,0,0);
  return ctx.getImageData(0,0,canvas.width,canvas.height)
}
ImageParser.prototype.redrawCanvas = function(map, fn){
  var canvas = document.getElementById('canvas');
  ctx = canvas.getContext("2d");
  data = fn(map);
  ctx.putImageData(data,0,0);
  return data;
}
ImageParser.prototype.filterGrayscale = function(data){
  //can delete this fxn soon
  //goal: turn every 4 items into x, x, x, 255 where x is the greyscale value
  _.each(
    data.data,
    function(element, index) {
      if ((index + 1) % 4 === 0){
        data.data[index] = 255;
        b = data.data[index - 1];
        g = data.data[index - 2];
        r = data.data[index - 3];
        gray = r/255 * 0.2126 + g/255 * 0.7152 + b/255 * 0.0722;
        gray255 = Math.round(gray * 255);
        data.data[index - 1] = gray255;
        data.data[index - 2] = gray255;
        data.data[index - 3] = gray255;
      } else {
        // data.data[index] = 255 - element; for inversion
      }
    });
  data['monoscale'] = true
  return data;
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

ImageParser.prototype.calculateNodes = function(data, number) {

  //choose the first node
  var chooseFirst = function(data) {
    var res = [];
    var randomNode = Math.floor(Math.random()*(data.data.length + 1));
    res.push(randomNode);
    return res;
  }

  return chooseFirst(data);

  
}
