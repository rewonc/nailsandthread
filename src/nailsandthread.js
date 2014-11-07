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
  storePixels: function(grid, pixels){
    grid.pixelStore = [];
    if (pixels.data.length % grid.size !== 0) console.log("storePixels ratio uneven; will affect results");
    var ratio = pixels.data.length / grid.size;

    for(var i=0;i<grid.size;i++){
      grid.pixelStore[i] = {red: pixels.data[i*ratio], green: pixels.data[i*ratio + 1] , blue: pixels.data[i*ratio + 2]};
    }
  },
  draw: function(grid, origin, next, pixelLine, pixels, thickness, color, pixelsToRender){
    //insert notes in the grid that you drew it.
    //console.log('drawing...');
    var locus = grid.rows[origin][next];
    if(locus === undefined) locus = {};
    if (locus[color] === undefined) locus[color] = 0;
    locus[color] +=1;
    grid.rows[origin][next] = locus;
    //Don't draw on the pixel store, as its a reference.
    //grid.pixelStore[origin][color] += -1*thickness.value;
    _.each(pixelLine, function(obj){
      var adjusted = obj.value - thickness.value;
      if (adjusted > 0) { pixels.data[obj.index] = adjusted;
                          pixelsToRender.data[obj.index] += thickness.value; }
      else              { pixels.data[obj.index] = 0; 
                          pixelsToRender.data[obj.index] += thickness.value; }
    });
  },
  findNextPointFarthest: function(origin, grid, pixels, color, thickness){
    var list = Grid.helpers.farthestNodesFrom(origin, grid);
    for(var i=0; i<grid.size-1;i+=Math.floor(Math.random()*100)){
      if(Grid.helpers.checkGridValidity(origin, list[i], grid, color, thickness) === true) {
        var pixelLine = Grid.helpers.getPixels(origin, list[i], grid, pixels, color);
        if(Grid.helpers.checkValidity(pixelLine, thickness)) return {pixelLine: pixelLine, next: list[i], prev: origin};
      }
    }
    return false;
  },
  findNextPointRandom: function(origin, grid, pixels, color, thickness){
    var randomPt = [];
    for (var i=0;i<grid.size/10;i++){
      randomPt[i] = Grid.helpers.getRandom(grid, thickness, color);
      if(Grid.helpers.checkGridValidity(origin, randomPt[i], grid, color, thickness) === true) {
        var pixelLine = Grid.helpers.getPixels(origin, randomPt[i], grid, pixels, color);
        if(Grid.helpers.checkValidity(pixelLine, thickness)) return {pixelLine: pixelLine, next: randomPt[i], prev: origin};
      }
    }
    return false;
  },
  findNextByWalking: function(origin, grid, pixels, color, thickness){
    //Find adjacent lines
    //we want large queries to be infrequent. so lets have a random 
    //distro along the power curve.
    
    //var rand = Math.random()*Math.log(50)/Math.LN10;
    //var adjust = Math.floor(Math.pow(10, rand)-30);
    //if (adjust < 0) adjust = 2;
    //var radius = adjust; 
    var list = Grid.helpers.nodesAdjacentTo(origin, grid, 4, color);
    for(var i=0; i<list.length;i++){
      if(Grid.helpers.checkGridValidity(origin, list[i], grid, color, thickness) === true) {
        var pixelLine = Grid.helpers.getPixels(origin, list[i], grid, pixels, color);
        if(Grid.helpers.checkValidity(pixelLine, thickness)) return {pixelLine: pixelLine, next: list[i], prev: origin};
      }
    }
    return false;
  },
  helpers: {
    farthestNodesFrom: function(origin, grid){
      var arr = [];
      for(var i=0;i<grid.size;i++){
        arr[i] = i;
      }
      return _.sortBy(arr, function(val){
        var row1 = Math.floor(origin/grid.width);
        var row2 = Math.floor(val/grid.width);
        var rowSquared = Math.pow(row2-row1, 2);
        var columnSquared = Math.pow((val - row2*grid.height) - (origin - row1*grid.height) , 2);
        var triangular = Math.sqrt(columnSquared + rowSquared);
        return triangular * -1;
      });
    },
    nodesAdjacentTo: function(origin, grid, radius, color, mock){
      var arr = [];
      //turn to rc
      var rcPoint = Grid.helpers.convertToRC(origin, grid.width, grid.height);
      //lets say row10, column10
      for(var i=rcPoint.row-radius;i<=rcPoint.row+radius;i++){
        for(var j=rcPoint.column-radius;j<=rcPoint.column+radius;j++){
          if(i<0 || j<0 || i>=grid.height || j>=grid.width || (i===rcPoint.row && j===rcPoint.column) ) {
            //do nothing
          } else {
            arr.push( Grid.helpers.rcToPixels(i, j, grid.width, grid.height) );
          }
        }
      }
      if (mock === true) return arr;
      return _.shuffle(arr);
      //return _.sortBy(arr, function(val){
      //  return grid.pixelStore[val][color];
      //});
    },
    getRandom: function(grid, thickness, color){
      return random();
      function random(){
        var rand = Math.floor(Math.random()*grid.size);
        if (grid.pixelStore[rand][color] < thickness.margin) return random();
        return rand;
      }
    },
    checkGridValidity: function (origin, target, grid, color, thickness){
      if (origin === target) return false;
      if (grid.rows[origin][target] && grid.rows[origin][target][color] === 1) return false;
      //we check against the value in GridReference because it is quick
      //way to tell what the color values in the area are.
      if (grid.pixelStore[target][color] < thickness.margin) return false;
      return true;
    },
    checkValidity: function(pixelLine, thickness){
      return _.every(pixelLine, function(obj){return obj.value > thickness.margin;});
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
      var i = 1;
      var res = [];
      var shift;
      if(color === "red")   shift=0;
      if(color === "green") shift=1;
      if(color === "blue")  shift=2;
      //console.log(JSON.stringify(slope));
      if (slope.start_with === "rows"){
        for(;i<slope.count;i++){
          (function(i){
            var index = Grid.helpers.rcToPixels(origin.row+(i*slope.increment), Math.round(origin.column+i*slope.slope), pixels.width, pixels.height, shift);
            res.push({index: index, value: pixels.data[index] });
          })(i);
        }
      } else{

        for(;i<slope.count;i++){
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
