'use strict';

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
      }
    });
    
    img.src = url;
    return result;
  }
};

var Grid = {
  generate: function(options) {

  },
  findNextPoint: function(origin, grid, pixels, color){

  }
};

var Canvas = {
  render: function(canvas, $element){

  }
};
