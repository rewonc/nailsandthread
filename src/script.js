
  $(function(){
    'use strict';
    //These are the canvases on the page
    var source = document.getElementById('source');
    var target = document.getElementById('target');

    //pixelLoader is a promise that will populate pixels when the image loads. Pixels stores what's left of the image; pixelsToRender is a store of what the algo is drawing.
    var pixelLoader = Parser.getRGB(source, 'img/400x400-dog.jpg');
    var pixels;
    var pixelsToRender;

    //grid is a (W*H)x(W*H) matrix, and tells us which node is linked to which node. It requires memory equivalent to (WxH)^2, so adjacency lists are better for graphs with many nodes. But this will work for img of size ~50x50.
    var grid;
    //gridAverages will say, for each node, what the accumulated CMYK values for all the pixels in that node's area are.
    //var gridPixelAverage;
    //Initial settings
    var lines_count = 0;
    var MAX_LINES_DRAWN_PER_THREAD = 1500;
    var MAX_LINES_OVERALL = 14000;


    var threads = [
      {c: 10, m: 0, y: 0, k: 0, name: "cyan"},
      {c: 0, m: 10, y: 0, k: 0, name: "magenta"},
      {c: 0, m: 0, y: 10, k: 0, name: "yellow"},
      {c: 0, m: 0, y: 0, k: 10, name: "black"},
    ];

    var drawNextLine = function(graph, thread, previous){
      var origin, result, nodes;
      if (previous === undefined) {
        origin = graph.getRandomNode();
      } else {
        origin = previous;
      }
      console.log(origin);
      result = graph.walkToNearbyNode(origin, thread);
      if(result.node !== undefined){
        console.log(result);
        graph.decrement(result.line, thread);
        //Canvas.render(pixelsToRender, origin, result.node, thread);  
       //return drawNextLine(graph, thread, result);  //w. a counter
      } else {
        console.log("undefined result from node search");
       //return drawNextLine(graph, thread, undefined);  //w. a counter
      }
    };
    
    var timeoutFn;
    var iter = function(graph){
      drawNextLine(graph, threads[3]);
      // drawColor(threads[1], MAX_LINES_DRAWN_PER_THREAD);
      // drawColor(threads[2], MAX_LINES_DRAWN_PER_THREAD);
      // drawColor(threads[3], MAX_LINES_DRAWN_PER_THREAD);
      // Canvas.putImage(source, pixels);
      // $('#count').html(lines_count);
      // if (lines_count < MAX_LINES_OVERALL) timeoutFn = setTimeout(iter, 10);
    };

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
    $('#clear').click(function(){
      localStorage.clear();
    });

    //start the algorithm on image load
    pixelLoader.then(function(val){
      pixels = val;
      console.log('starting...');
      /*if (localStorage && localStorage.getItem("grid") ){
        grid = JSON.parse(localStorage.getItem("grid"));
      } else if (localStorage) {
        console.log("Grid loaded from storage");
        grid = Grid.generate({width: 40, height: 40});
        Grid.storePixels(grid, pixels);
        localStorage.setItem("grid", JSON.stringify(grid));
      } else{
        grid = Grid.generate({width: 40, height: 40});
        Grid.storePixels(grid, pixels);
      }*/
      var graph = new Graph(pixels, {width: 40, height: 40});
      //console.log(grid);
      console.log(graph);
      console.log(graph.getMiddleNodes(0, 121));

      pixelsToRender = Canvas.newImageData(target, pixels.width, pixels.height, 255);
      
      iter(graph);
    });

      
  });
