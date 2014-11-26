/*global document: true, Canvas: true, Parser: true, Graph: true */
$(function () {
  'use strict';
  //todo -- improve nodeValues rendition of the page

  //Constants to adjust per drawing
  var MAX_RADIUS = 3;
  var LINE_INTENSITY = 9;
  var RENDER_INTENSITY = 1;
  var GRAPH_WIDTH = 47;
  var GRAPH_HEIGHT = 54;
  var IMAGE_SOURCE = 'img/470x540-dcraig.jpg';

  //These correspond to real-life strings and can be adjusted for real color characteristics
  var threads = [
    {c: LINE_INTENSITY, m: 0, y: 0, k: 0, render: {c: RENDER_INTENSITY, m: 0, y: 0, k: 0}, name: "cyan" },
    {c: 0, m: LINE_INTENSITY, y: 0, k: 0, render: {c: 0, m: RENDER_INTENSITY, y: 0, k: 0}, name: "magenta" },
    {c: 0, m: 0, y: LINE_INTENSITY, k: 0, render: {c: 0, m: 0, y: RENDER_INTENSITY, k: 0}, name: "yellow" },
    {c: 0, m: 0, y: 0, k: LINE_INTENSITY, render: {c: 0, m: 0, y: 0, k: RENDER_INTENSITY}, name: "key" }
  ];

  //These are the canvases on the page
  var source = document.getElementById('source');
  var target = document.getElementById('target');

  //pixelLoader is a promise that will populate pixels when the image loads. 
  //Pixels stores what's left of the image; pixelsToRender/nodeValues is a store of what the algo is drawing.
  var pixelLoader = Parser.getRGB(source, IMAGE_SOURCE);
  var pixels;
  var pixelsToRender, nodeValues;

  var timeoutFn = {};

  var drawNextLine = function (graph, thread, previous) {
    var origin, result;
    if (previous === undefined) {
      origin = graph.getRandomNode();
    } else {
      origin = previous;
    }
    result = graph.walkToNearbyNode(origin, thread, MAX_RADIUS);
    if (result.node !== undefined) {
      graph.addEdge(origin, result.node);
      graph.decrement(result.line, thread);
      Canvas.paint(pixelsToRender, origin, result.node, thread.render, graph);
      timeoutFn[thread.name] = setTimeout(function () {
        drawNextLine(graph, thread, result.node);
      }, 2);
      Canvas.putImage(target, pixelsToRender);
    } else {
      console.log("undefined result from node search");
      timeoutFn[thread.name] = setTimeout(function () {
        drawNextLine(graph, thread);
      }, 2);
      Canvas.putImage(target, pixelsToRender);
    }
  };

  var init = function (graph) {
    drawNextLine(graph, threads[0]);
    drawNextLine(graph, threads[1]);
    drawNextLine(graph, threads[2]);
    drawNextLine(graph, threads[3]);
  };

  //start the algorithm on image load
  pixelLoader.then(function (val) {
    pixels = val;
    console.log('starting...');

    var graph = new Graph(pixels, {
      width: GRAPH_WIDTH,
      height: GRAPH_HEIGHT
    });

    //the thread size should adjust to the square root of the ratio. That will be around the average
    //line intensity we want.

    console.log(graph);
    pixelsToRender = Canvas.newImageData(target, pixels.width, pixels.height,
      255);
    nodeValues = Canvas.newImageData(target, graph.width, graph.height,
      255);

    $('#pause').click(function () {
      _.each(timeoutFn, function (obj) {
        clearTimeout(obj);
      });
      console.log(graph);
      console.log(pixelsToRender);
      console.log(nodeValues);
    });
    $('#restart').click(function () {
      init(graph);
    });
    $('#show').click(function () {
      $(source).show();
    });

    $('#nodes').click(function () {
      Canvas.renderNodes(target, nodeValues, graph);
    });

    init(graph);

  });

});