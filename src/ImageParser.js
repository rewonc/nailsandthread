var _; /*globals*/

function ImageParser(src) {
  this.src = src;
  var image = new Image();
  image.src = this.src;
}
ImageParser.prototype.generateDataMap = function() {
  return 'data map'; 
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
  console.log(data);
  ctx.putImageData(data,0,0);
  return data;
}
ImageParser.prototype.filterGrayscale = function(data){
  _.each(
    data.data,
    function(element, index) {
      if ((index + 1) % 4 === 0){
        data.data[index] = 255;
      } else {
        data.data[index] = 255 - element;
      }
    });
  data['monoscale'] = true
  return data;
}

/*
var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var img = new Image();
    img.onload = function (){
      ctx.drawImage(img,0,0);
      var imgData = ctx.getImageData(0,0,150,150);
      console.log(imgData);
    }
    img.src = "img/abc.jpg";
*/


/*function Player() {
}
Player.prototype.play = function(song) {
  this.currentlyPlayingSong = song;
  this.isPlaying = true;
};

Player.prototype.pause = function() {
  this.isPlaying = false;
};

Player.prototype.resume = function() {
  if (this.isPlaying) {
    throw new Error("song is already playing");
  }

  this.isPlaying = true;
};

Player.prototype.makeFavorite = function() {
  this.currentlyPlayingSong.persistFavoriteStatus(true);
};*/