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
    var result = "next: " + selectNext(origin, grid);
    //randomly select the next point
    //check if it is populated(if so, restart)
    //check if it is feasible(if not, restart)
    //if restart more than 10 times, choose another path
    //else, decrement the value of all the arrays
    //return the next node
    return result;
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
  }
};

var Canvas = {
  render: function(canvas, $element){

  }
};
