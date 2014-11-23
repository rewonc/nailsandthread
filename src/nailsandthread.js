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
    
    //each pixel will store the aggregated color information from the pixels in its grid.
    var ratio = pixels.data.length / grid.size;

    var aggregateColors = function(element, ratio, pixels){
      //needs to loop from element to element + ratio (not inclusive)
      //both ways
      var width = pixels.width;
      var res = {c: 0, m: 0, y: 0, k: 0};

      var addToRes = function(count){
        var cmyk = Grid.helpers.RGBtoCMYK({red: pixels.data[count], green: pixels.data[count+1], blue: pixels.data[count+2]});
        res.c += cmyk.c;
        res.m += cmyk.m;
        res.y += cmyk.y;
        res.k += cmyk.k;
      };

      for (var i=0;i<ratio;i++){
        for(var j=0;j<ratio;j++){
          addToRes(element + i*width + j);
        }
      }

      return res;
    };

    for(var i=0;i<grid.size;i++){
      grid.pixelStore[i] = aggregateColors(i*ratio*4, ratio, pixels); 
    }
  },
  draw: function(grid, origin, next, pixelLine, pixels, thread, pixelsToRender){
    grid.rows[origin][next] = thread.name;
    _.each(pixelLine, function(obj){
      var cmyk = Grid.helpers.RGBtoCMYK(obj);
      var adjusted = {};
      adjusted.c = cmyk.c - thread.c;
      adjusted.m = cmyk.m - thread.m;
      adjusted.y = cmyk.y - thread.y;
      adjusted.k = cmyk.k - thread.k;

      var adjustedRGB = Grid.helpers.CMYKtoRGB(adjusted); 
      var threadRGB = Grid.helpers.CMYKtoRGB(thread);

      //render subtraction to existng canvas
      pixels.data[obj.index] = adjustedRGB.red;
      pixels.data[obj.index + 1] = adjustedRGB.green;
      pixels.data[obj.index + 2] = adjustedRGB.blue;
      //render addition to new canvas
      pixelsToRender.data[obj.index] += (threadRGB.red - 255) ;
      pixelsToRender.data[obj.index + 1] += (threadRGB.green - 255); 
      pixelsToRender.data[obj.index + 2] += (threadRGB.blue - 255);
    });
  },
  findNextByWalking: function(origin, grid, pixels, thread){
    //Find adjacent lines
    //we want large queries to be infrequent. so lets have a random 
    //distro along the power curve.
    
    var rand = Math.random()*Math.log(50)/Math.LN10;
    var adjust = Math.floor(Math.pow(10, rand)-30);
    if (adjust < 0) adjust = 2;
    var radius = adjust; 
    var list = Grid.helpers.nodesAdjacentTo(origin, grid, radius);
    for(var i=0; i<list.length;i++){
      if(Grid.helpers.checkGridValidity(origin, list[i], grid) === true) {
        var pixelLine = Grid.helpers.getPixels(origin, list[i], grid, pixels);
        if(Grid.helpers.checkValidity(pixelLine, thread)) return {pixelLine: pixelLine, next: list[i], prev: origin};
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
    nodesAdjacentTo: function(origin, grid, radius, mock){
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
    },
    getRandom: function(grid, thread){
      var MARGIN = 0.75;
      return random();
      function random(){
        var rand = Math.floor(Math.random()*grid.size);
        if (grid.pixelStore.c< thread.c) return random();
        if (grid.pixelStore.m< thread.m) return random();
        if (grid.pixelStore.y< thread.y) return random();
        if (grid.pixelStore.k< thread.k) return random();
        //if (grid.pixelStore[rand].red < thread.red*MARGIN) return random();
        //if (grid.pixelStore[rand].green < thread.green*MARGIN) return random();
        //if (grid.pixelStore[rand].blue < thread.blue*MARGIN) return random();
        return rand;
      }
    },
    checkGridValidity: function (origin, target, grid){
      if (origin === target) return false;
      if (grid.rows[origin][target]) return false;
      return true;
    },
    checkValidity: function(pixelLine, thread){
      return _.every(pixelLine, function(obj){
        var cmyk = Grid.helpers.RGBtoCMYK(obj);
        if (cmyk.c< thread.c) return false;
        if (cmyk.m< thread.m) return false;
        if (cmyk.y< thread.y) return false;
        if (cmyk.k< thread.k) return false;
        /*
      var MARGIN = 0.75;
        if (obj.red < thread.red*MARGIN) return false;
        if (obj.green < thread.green*MARGIN) return false;
        if (obj.blue < thread.blue*MARGIN) return false;
        */
        return true;
      });
    },
    getLast: function (origin){
      //console.log("End of line.");
      return false;
    },
    getPixels: function(origin, next, grid, pixels){
      var gridLength = grid.size;
      var pixelLength = pixels.data.length / 4;
      if (pixelLength % gridLength !== 0) console.log('Warning: Grid/pixel ratio off balance. Balance for better results.');
      var rcOrigin = Grid.helpers.convertToRC(origin, grid.width, grid.height);
      var rcNext = Grid.helpers.convertToRC(next, grid.width, grid.height);
      var originImg = Grid.helpers.scaleToImage(rcOrigin, grid.width, grid.height, pixels.width, pixels.height);
      var nextImg = Grid.helpers.scaleToImage(rcNext, grid.width, grid.height, pixels.width, pixels.height);
      var slope = Grid.helpers.findSlope(originImg, nextImg);
      return Grid.helpers.pixellate(originImg, nextImg, slope, pixels);
    },
    pixellate: function(origin, next, slope, pixels){
      //slope in form: {"start_with":"rows","increment":1,"slope":0.6341463414634146,"count":410} 
      var i = 1;
      var res = [];
      if (slope.start_with === "rows"){
        for(;i<slope.count;i++){
          (function(i){
            var index = Grid.helpers.rcToPixels(origin.row+(i*slope.increment), Math.round(origin.column+i*slope.slope), pixels.width, pixels.height, 0);
            res.push({index: index, red: pixels.data[index], green: pixels.data[index+1], blue: pixels.data[index+2] });
          })(i);
        }
      } else{

        for(;i<slope.count;i++){
          (function(i){
            var index = Grid.helpers.rcToPixels(Math.round(origin.row+i*slope.slope), origin.column+(i*slope.increment), pixels.width, pixels.height, 0);
            res.push({index: index, red: pixels.data[index], green: pixels.data[index+1], blue: pixels.data[index+2] });
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
    },
    RGBtoCMYK: function(obj){
      var red = obj.red/255,
        green = obj.green/255,
         blue = obj.blue/255,  
            k = 1 - Math.max(red, green, blue),
            c, m, y;
      if (k === 1) {
        return {c: 0, m: 0, y: 0, k: 1};
      } else{
        c = (1 - red - k) / (1 - k);
        m = (1 - green - k) / (1 - k);
        y = (1 - blue - k) / (1 - k);
        return {c: c, m: m, y: y, k: k};
      }
    },
    CMYKtoRGB: function(obj){
      return {
        red: 255 * (1-obj.c) * (1-obj.k),
        green: 255 * (1-obj.m) * (1-obj.k),
        blue: 255 * (1-obj.y) * (1-obj.k),
      };
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
      imgdata.data[i+0] = 255;
      imgdata.data[i+1] = 255;
      imgdata.data[i+2] = 255;
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
