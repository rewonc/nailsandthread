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
      grid.rows[i] = [];
    }
    return grid;
  },
  draw: function(grid, origin, next, pixelLine, pixels, thickness, color, pixelsToRender){
    //insert notes in the grid that you drew it.
    //console.log('drawing...');
    var locus = grid.rows[origin][next];
    if(locus === undefined) locus = {};
    locus[color] = 1;
    grid.rows[origin][next] = locus;
    _.each(pixelLine, function(obj){
      var adjusted = obj.value - thickness.value;
      if (adjusted > 0) { pixels.data[obj.index] = adjusted;
                          pixelsToRender.data[obj.index] += thickness.value; }
      else              { pixels.data[obj.index] = 0; 
                          pixelsToRender.data[obj.index] += thickness.value; }
    });
  },
  findNextPoint: function(origin, grid, pixels, color, thickness, pixelsToRender, counter){
    //loop terminators
    counter = counter || 0;
    if (counter > 100) {return Grid.helpers.getLast(origin);}
    //select next point
    var next = Grid.helpers.selectNext(origin, grid, color, pixels);
    if (next === false) return Grid.helpers.getLast(origin);

    //get the pixels
    var pixelLine = Grid.helpers.getPixels(origin, next, grid, pixels, color);
    var valid = Grid.helpers.checkValidity(pixelLine, thickness);
    if(valid === false) return Grid.findNextPoint(origin, grid, pixels, color, thickness, pixelsToRender, counter + 1);
    
    //draw the pixels and note in Grid
    //console.log("drawing line from: " + origin + " to " + next);
    Grid.draw(grid, origin, next, pixelLine, pixels, thickness, color, pixelsToRender);
    return {next: next};
  },
  helpers: {
    getRandom: function(grid){
      return Math.floor(Math.random()*grid.size);
    },
    checkPopulated: function (origin, target, grid, color){
      if (origin === target) return true;
      if (grid.rows[origin][target] && grid.rows[origin][target][color] === 1) return true;
      return false;
    },
    checkValidity: function(pixelLine, thickness){
      return _.every(pixelLine, function(obj){return obj.value > thickness.margin;});
    },
    selectNext: function (origin, grid, color, pixels, counter){
      counter = counter || 0;
      if(counter > 200) return false;
      //origin is int in grid. grid has grid.rows, height width size. color is "red". 
      //pixels is imagedata. counter is a counter.
      //So we should loop through the farthest points. Maybe generate an array of the 
      //farthest points, check in line until find, rather than having a counter. 
      //if no find, then start over. 
      var x = Grid.helpers.getRandom(grid);
      if(!Grid.helpers.checkPopulated(origin, x, grid, color)) return x;
      return Grid.helpers.selectNext(origin, grid, color, pixels, counter + 1);
    },
    getLast: function (origin){
      //console.log("End of line.");
      return false;
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
      return Grid.helpers.pixellate(originImg, nextImg, slope, color, pixels);
    },
    pixellate: function(origin, next, slope, color, pixels){
      //slope in form: {"start_with":"rows","increment":1,"slope":0.6341463414634146,"count":410} 
      var i = 0;
      var res = [];
      var shift;
      if(color === "red")   shift=0;
      if(color === "green") shift=1;
      if(color === "blue")  shift=2;
      //console.log(JSON.stringify(slope));
      if (slope.start_with === "rows"){
        for(;i<=slope.count;i++){
          (function(i){
            var index = Grid.helpers.rcToPixels(origin.row+(i*slope.increment), Math.round(origin.column+i*slope.slope), pixels.width, pixels.height, shift);
            res.push({index: index, value: pixels.data[index] });
          })(i);
        }
      } else{

        for(;i<=slope.count;i++){
          (function(i){
            var index = Grid.helpers.rcToPixels(Math.round(origin.row+i*slope.slope), origin.column+(i*slope.increment), pixels.width, pixels.height, shift);
            res.push({index: index, value: pixels.data[index]});
          })(i);
        }
      }
      return res;
    },
    rcToPixels: function(row, column, width, height, colorShift){
      var natural = (row*width) + column;
      if(colorShift === undefined) return natural;
      return natural * 4 + colorShift;
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
  render: function(canvas, grid){
    console.log(grid);

  },
  newImageData: function(canvas, width, height, opacity){
    var context = canvas.getContext('2d');
    var imgdata = context.createImageData(width, height);
    for(var i=0; i<imgdata.data.length; i+=4){
      imgdata.data[i+3] = opacity;
    }
    return imgdata;
  },
  putImage: function(canvas, data){
    canvas.width = data.width;
    canvas.height = data.height;//console.log('put image');
    var context = canvas.getContext('2d');
    context.putImageData(data, 0, 0);
  }
};
