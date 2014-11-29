/*global document: true, Canvas: true, Parser: true, Graph: true */
$(function () {
  'use strict';

  //Constants to adjust per drawing
  var MAX_RADIUS = 8;
  var SCALE_COEFFICIENT = 5;
  var LINE_INTENSITY = 5 / SCALE_COEFFICIENT;
  var RENDER_INTENSITY = 0.8;
  var GRAPH_WIDTH = 40 * SCALE_COEFFICIENT;
  var GRAPH_HEIGHT = 60 * SCALE_COEFFICIENT;
  var IMAGE_SOURCE = 'img/beard-400-600.jpg';

  //Track number of lines drawn
  var numLinesDrawn = 1;

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
      }, 1);
      Canvas.putImage(target, pixelsToRender);
    } else {
      console.log("undefined result from node search");
      timeoutFn[thread.name] = setTimeout(function () {
        drawNextLine(graph, thread);
      }, 1);
      Canvas.putImage(target, pixelsToRender);
    }
  };

  var connectNodes = function (origin, result, graph, thread) {
    console.log("connectNodes");
    graph.addEdge(origin, result.node);
    graph.decrement(result.line, thread);
    Canvas.paint(pixelsToRender, origin, result.node, thread.render, graph);
    Canvas.putImage(target, pixelsToRender);
  };

  var continuousLine = function (graph, thread, level, start, end) {

    if (level === 0) {
      console.log('line exhausted');
      numLinesDrawn++;
      $('#count').text(numLinesDrawn);
      return continuousLine(graph, thread, MAX_RADIUS);
    }
    console.log('contLine');
    var result, scan1, scan2;

    if (start === undefined || end === undefined) {
      console.log('undefined block');
      start = graph.getRandomNode();
      result = graph.walkToNearbyNode(start, thread, level);
      if (result.node !== undefined) {
        connectNodes(start, result, graph, thread);
        continuousLine(graph, thread, level, start, result.node);
        return;
      }
      return continuousLine(graph, thread, level);
    }

    scan1 = graph.scanRadius(start, thread, level);
    if (scan1.node !== undefined) {
      console.log('first scan');
      connectNodes(start, scan1, graph, thread);
      timeoutFn[thread.name] = setTimeout(function () {
        continuousLine(graph, thread, level, scan1.node, end);
      }, 1);
      return;
    }

    scan2 = graph.scanRadius(end, thread, level);
    if (scan2.node !== undefined) {
      console.log('second scan');
      connectNodes(start, scan2, graph, thread);
      timeoutFn[thread.name] = setTimeout(function () {
        continuousLine(graph, thread, level, scan2.node, start);
      }, 1);
      return;
    }

    console.log('scan failure');
    timeoutFn[thread.name] = setTimeout(function () {
      continuousLine(graph, thread, level - 1, start, end);
    }, 1);
    return;

  };

  var init = function (graph) {
    drawNextLine(graph, threads[0]);
    drawNextLine(graph, threads[1]);
    drawNextLine(graph, threads[2]);
    continuousLine(graph, threads[3], MAX_RADIUS);
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
    // init(graph);

  });

});