'use strict';
  $(function(){
    //These are the canvases on the page
    var source = document.getElementById('source');
    var target = document.getElementById('target')

    //pixelLoader is a promise that will populate pixels when the image loads. Pixels stores what's left of the image; pixelsToRender is a store of what the algo is drawing.
    var pixelLoader = Parser.getRGB(source, 'img/400x400-dog.jpg');
    var pixels;
    var pixelsToRender;

    //grid is a (W*H)x(W*H) matrix, and tells us which node is linked to which node. It requires memory equivalent to (WxH)^2, so adjacency lists are better for graphs with many nodes. But this will work for img of size ~50x50.
    var grid = Grid.generate({width: 40, height: 40});
    //gridAverages will later describe the 
    var gridAverages;
    //Initial settings
    var lines_count = 0;
    var MAX_LINES_DRAWN_PER_THREAD = 1500;
    var MAX_LINES_OVERALL = 14000;


    var threads = [
      {c: 0.2, m: 0, y: 0, k: 0, name: "midcyan"},
      {c: 0, m: 0.2, y: 0, k: 0, name: "midmagenta"},
      {c: 0, m: 0, y: 0.2, k: 0, name: "midyellow"},
      {c: 0, m: 0, y: 0, k: 0.2, name: "midgray"},
    ];

    var drawColor = function(thread, count, node, previous){
      if (count === 0) {console.log("line ended at " + MAX_LINES_DRAWN_PER_THREAD);lines_count+= MAX_LINES_DRAWN_PER_THREAD; return;}
      var origin;
      if (node === undefined && previous === undefined){
        origin = Grid.helpers.getRandom(grid, thread);
      } else {
        origin = node; 
      }
      var result = Grid.findNextByWalking(origin, grid, pixels, thread);
      if (typeof result.next === "number")  {
        Grid.draw(grid, origin, result.next, result.pixelLine, pixels, thread, pixelsToRender);
        return drawColor(thread, count - 1, result.next, result.prev);    
      }
      else {
        lines_count += MAX_LINES_DRAWN_PER_THREAD - count;
        return;
      }
    }
    
    var timeoutFn;
    var iter = function(){
      drawColor(threads[0], MAX_LINES_DRAWN_PER_THREAD);
      drawColor(threads[1], MAX_LINES_DRAWN_PER_THREAD);
      drawColor(threads[2], MAX_LINES_DRAWN_PER_THREAD);
      drawColor(threads[3], MAX_LINES_DRAWN_PER_THREAD);
      Canvas.putImage(source, pixels);
      $('#count').html(lines_count);
      if (lines_count < MAX_LINES_OVERALL) timeoutFn = setTimeout(iter, 10);
    }

    $('#pause').click(function(){
      clearTimeout(timeoutFn);
      console.log(grid);
    });
    $('#restart').click(function(){
      timeoutFn = setTimeout(iter, 10);
    });
    $('#render').click(function(){
      console.log(pixelsToRender);
      Canvas.putImage(target, pixelsToRender);
    });

    //start the algorithm on image load
    pixelLoader.then(function(val){
      pixels = val;
      console.log('starting...');
      Grid.storePixels(grid, pixels);
      pixelsToRender = Canvas.newImageData(target, pixels.width, pixels.height, 255);
      iter();
    });

      
  });
