var _; /*globals*/

function ImageParser(src) {
  this.src = src;
  var image = new Image();
  image.src = this.src;
}
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

ImageParser.prototype.calculateNodes = function(data, number) {

  //choose the first node
  var chooseFirst = function(data) {
    var res = [];
    var randomNode = Math.floor(Math.random()*(data.data.length + 1));
    res.push(randomNode);
    return res;
  }
  

 

  return chooseFirst(data);

   //draw all lines between nodes (max 4/16 per couple)


  //for choosing a new node, choose one that will offer the maximal coverage
  //that is, take the floor of each and calculate the points? mapreduce?
  //turn the array into a 
  
  //now, e.g., how to calculate the 
  //a defition of an ideal node might be: a point that, when all other n-1 nodes are set,
  //allows for the most scoring of points. node 1 should be the darkest point, node 2 should be the best 2,
  //etc. There are 4 possible connections between each node. Lets say 16 is the maximum darkness for each.
  //so 256/16 = 16 darkness "points" for each pixel drawn on the line. 



  //what's a functional approach here?
  //translate data map to single grayscale array
  //three data points: grayscale array, node array, line array
  //f1: given grayscale array and node array, calculate next best point, return pt
  //f2: 
  //originally have map of pixels, + array of nodes
  //each iteration will add the nodes, 
  //also have an array 
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