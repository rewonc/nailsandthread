'use strict';
var _; 

var Parser = {
  getRGB: function(canvas, url){
    var img = new Image();
    var context = canvas.getContext('2d');
    var result = new Promise(function(resolve, reject){
      img.onload=function(){
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img,0,0);
        resolve(context.getImageData(0,0,canvas.width,canvas.height));
      };
    });
    
    img.src = url;
    return result;
  }
};

var Grid = {
  generate: function(options) {
    //try an adjacency matrix for this for quick scanning
    var grid = {}
    grid.rows = [];
    grid.size = options.height*options.width;
    grid.width = options.width;
    grid.height = options.height;
    for(var i=0;i<grid.size;i++){
      grid.rows[i] = new Array(grid.size);
    }
    return grid;
  },
  findNextPoint: function(origin, grid, pixels, color, thickness){
    var next = selectNext(origin, grid);
    if (next === false) return getLast();
    var pixelLine = getPixels(origin, next, grid, pixels);
    //check if it is feasible(if not, restart)
    //if restart more than 10 times, choose another path
    //else, decrement the value of all the arrays
    //return the next node
    console.log(result);

    function getRandom(grid){
      return Math.floor(Math.random()*grid.size);
    }
    function checkPopulated(origin, target){
      if (origin === target) return true;
      if (grid.rows[origin][target] && color in grid.rows[origin][target]) return true;
      return false;
    }
    function selectNext(origin, grid, counter){
      counter = counter || 0;
      if(counter > 10) return false;
      var x = getRandom(grid);
      if(!checkPopulated(origin, x)) return x;
      return selectNext(origin, grid, counter + 1);
    }
    function getLast(){
      console.log("getLast triggered--Needs implementation!!!");
      return origin;
    }
    function getPixels(origin, next, grid, pixels){
      var gridLength = grid.size;
      var pixelLength = pixels.data.length / 4;
      if (pixelLength % gridLength !== 0) console.log('Warning: Grid/pixel ratio off balance. Balance for better results.');
      console.log("grid size: " + gridLength);
      console.log("pixel size: " + pixelLength);
      console.log("ratio: " + pixelLength / gridLength); 
    }
  }
};

var Canvas = {
  render: function(canvas, $element){

  }
};
