'use strict';
  $(function(){
    //These are the canvases on the page
    var source = document.getElementById('source');
    var target = document.getElementById('target')

    //pixelLoader is a promise that will populate pixels when the image loads. Pixels stores what's left of the image; pixelsToRender is a store of what the algo is drawing.
    var pixelLoader = Parser.getRGB(source, 'img/man.jpg');
    var pixels;
    var pixelsToRender;
    //todo: log starting lines.

    //grid is a (W*H)x(W*H) matrix, and tells us which node is linked to which node. It requires memory equivalent to (WxH)^2, so adjacency lists are better for graphs with many nodes. But this will work for img of size ~50x50.
    var grid = Grid.generate({width: 70, height: 108});
    //Initial settings
    var lines_count = 0;
    var MAX_LINES_DRAWN_PER_THREAD = 1500;
    var MAX_LINES_OVERALL = 6000;
    //5, 2, 6, 12, 15,  
    var threads = [
      {red: 76, green: 77, blue: 72, name: "forest green / gray"},
      {red: 125, green: 56, blue: 61, name: "bright red"},
      {red: 212, green: 157, blue: 165, name: "pink"},
      {red: 196, green: 133, blue: 114, name: "peach"},
      {red: 201, green: 105, blue: 97, name: "peach"},
      {red: 247, green: 237, blue: 239, name: "white pink"},
      {red: 219, green: 219, blue: 217, name: "white"},
      {red: 49, green: 70, blue: 99, name: "darkblue"},
      {red: 105, green: 151, blue: 194, name: "lightbluee"},
      {red: 158, green: 146, blue: 131, name: "brownish"},
      {red: 132, green: 141, blue: 145, name: "grayblue"},
      {red: 55, green: 61, blue: 92, name: "purp blue"},
      {red: 195, green: 207, blue: 169, name: "lightgreen"},
      {red: 85, green: 102, blue: 81, name: "greenish"},
      {red: 74, green: 53, blue: 73, name: "purp"},
      {red: 201, green: 194, blue: 189, name: "silva"},
      {red: 153, green: 143, blue: 135, name: "dark silver"}
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
      drawColor(threads[7], MAX_LINES_DRAWN_PER_THREAD);
      drawColor(threads[11], MAX_LINES_DRAWN_PER_THREAD);
      drawColor(threads[13], MAX_LINES_DRAWN_PER_THREAD);
      drawColor(threads[1], MAX_LINES_DRAWN_PER_THREAD);
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


    pixelLoader.then(function(val){
      pixels = val;
      console.log('starting...');
      Grid.storePixels(grid, pixels);
      pixelsToRender = Canvas.newImageData(target, pixels.width, pixels.height, 255);
      iter();
    });

      
  });
