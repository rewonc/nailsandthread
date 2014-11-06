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
    var grid = {};
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
    var next = Grid.helpers.selectNext(origin, grid, color);
    console.log("next: " + next);
    if (next === false) return Grid.helpers.getLast(origin);
    var pixelLine = Grid.helpers.getPixels(origin, next, grid, pixels, color);
    //check if it is feasible(if not, restart)
    //if restart more than 10 times, choose another path
    //else, decrement the value of all the arrays
    //return the next node
    console.log(pixelLine);
    return "nextPt";
  },
  helpers: {
    getRandom: function(grid){
      return Math.floor(Math.random()*grid.size);
    },
    checkPopulated: function (origin, target, grid, color){
      if (origin === target) return true;
      if (grid.rows[origin][target] && color in grid.rows[origin][target]) return true;
      return false;
    },
    selectNext: function (origin, grid, color, counter){
      counter = counter || 0;
      if(counter > 10) return false;
      var x = Grid.helpers.getRandom(grid);
      if(!Grid.helpers.checkPopulated(origin, x, grid, color)) return x;
      return Grid.helpers.selectNext(origin, grid, color, counter + 1);
    },
    getLast: function (origin){
      console.log("getLast triggered--Needs implementation!!!");
      return origin;
    },
    getPixels: function(origin, next, grid, pixels, color){
      var gridLength = grid.size;
      var pixelLength = pixels.data.length / 4;
      if (pixelLength % gridLength !== 0) console.log('Warning: Grid/pixel ratio off balance. Balance for better results.');
      var rcOrigin = Grid.helpers.convertToRC(origin, grid.width, grid.height);
      var rcNext = Grid.helpers.convertToRC(next, grid.width, grid.height);
      var originImg = Grid.helpers.scaleToImage(rcOrigin, grid.width, grid.height, pixels.width, pixels.height);
      var nextImg = Grid.helpers.scaleToImage(rcNext, grid.width, grid.height, pixels.width, pixels.height);
      var slope = Grid.helpers.findSlope(originImg, nextImg);
       
      return Grid.helpers.pixellate(origin, next, slope, color, pixels)
      
      

      //console.log("origin: " + origin + "//" + JSON.stringify(rcOrigin) + "//" + JSON.stringify(originImg));
      //console.log("next: " + next + "//" + JSON.stringify(rcNext) + "//" + JSON.stringify(nextImg));
      /*console.log("grid size: " + gridLength);
      console.log("grid dimensons: " + grid.width + 'x' + grid.height);
      console.log("pixel size: " + pixelLength);
      console.log("pixel dimensions: " + pixels.width + 'x' + pixels.height);
      console.log("ratio: " + pixelLength / gridLength); */
    },
    pixellate: function(origin, next, slope, color, pixels){
      //slope in form: {"start_with":"rows","increment":1,"slope":0.6341463414634146,"count":410} 
      var i = 0;
      var res = [];
      var shift;
      if(color === "red")   shift=0;
      if(color === "green") shift=1;
      if(color === "blue")  shift=2;
      console.log(JSON.stringify(slope));
      if (slope.increment === 1 && slope.start_with === "rows"){
        for(i;i<=slope.count;i++){

        }
      } 
    },
    rcToPixels: function(row, column, width, height){
      return (row*width) + column;
    },
    findSlope: function(origin, next){
      var rowDiff = next.row - origin.row;
      var colDiff = next.column - origin.column;
      var startWith, increment, slope, count;
      if (Math.abs(rowDiff) >= Math.abs(colDiff)) {
        startWith = "rows";
        increment = rowDiff < 0 ? -1 : 1;
        slope = colDiff/rowDiff*increment;
        count = Math.abs(rowDiff);
      } else {
        startWith = "columns";
        increment = colDiff < 0 ? -1 : 1;
        slope = rowDiff/colDiff*increment;
        count = Math.abs(colDiff);
      }
      return {start_with: startWith, increment: increment, slope: slope, count: count};


    },
    convertToRC: function (point, width, height){
      var row = Math.floor(point / width);
      return {row: row, column: point - width*row};
    },
    scaleToImage: function(rcPoint, width1, height1, width2, height2){
      return {row: height2/height1*rcPoint.row, column: width2/width1*rcPoint.column};
    }
  }
};
    
var Canvas = {
  render: function(canvas, $element){

  }
};
