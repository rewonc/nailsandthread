/*global document: true, Canvas: true, Parser: true, Graph: true */
$(function () {
  'use strict';

  //Constants to adjust per drawing
  var MAX_RADIUS = 2;
  var SCALE_COEFFICIENT = 1;
  var LINE_INTENSITY = 6 / SCALE_COEFFICIENT;
  var GRAPH_WIDTH = 46 * SCALE_COEFFICIENT;
  var GRAPH_HEIGHT = 60 * SCALE_COEFFICIENT;
  var IMAGE_SOURCE = 'img/tian-460-600-vib.jpg';

  //Track number of lines drawn
  var numLinesDrawn = 1;

  //These correspond to real-life strings and can be adjusted for real color characteristics
  // var threads = [{
  //   c: LINE_INTENSITY,
  //   m: 0,
  //   y: 0,
  //   k: 0,
  //   render: {
  //     c: 1,
  //     m: 0,
  //     y: 0,
  //     k: 0
  //   },
  //   name: "cyan"
  // }, {
  //   c: 0,
  //   m: LINE_INTENSITY,
  //   y: 0,
  //   k: 0,
  //   render: {
  //     c: 0,
  //     m: 1,
  //     y: 0,
  //     k: 0
  //   },
  //   name: "magenta"
  // }, {
  //   c: 0,
  //   m: 0,
  //   y: LINE_INTENSITY,
  //   k: 0,
  //   render: {
  //     c: 0,
  //     m: 0,
  //     y: 1,
  //     k: 0
  //   },
  //   name: "yellow"
  // }, {
  //   c: 0,
  //   m: 0,
  //   y: 0,
  //   k: LINE_INTENSITY,
  //   render: {
  //     c: 0,
  //     m: 0,
  //     y: 0,
  //     k: 1
  //   },
  //   name: "key"
  // }];
  var threads = [{
    c: 0,
    m: 0.86 * LINE_INTENSITY,
    y: 0.5 * LINE_INTENSITY,
    k: LINE_INTENSITY * 0.271,
    render: {
      c: 0,
      m: 0.86,
      y: 0.5,
      k: 0.271
    },
    name: "magneta"
  }, {
    c: 0.649 * LINE_INTENSITY,
    m: 0.131 * LINE_INTENSITY,
    y: 0,
    k: 0.341 * LINE_INTENSITY,
    render: {
      c: 0.649,
      m: 0.131,
      y: 0,
      k: 0.341
    },
    name: "cyan"
  }, {
    c: 0,
    m: 0.07 * LINE_INTENSITY,
    y: 0.42 * LINE_INTENSITY,
    k: 0,
    render: {
      c: 0,
      m: 0.07,
      y: 0.42,
      k: 0
    },
    name: "yellow"
  }, {
    c: 0,
    m: 0,
    y: 0,
    k: 0.949 * LINE_INTENSITY,
    render: {
      c: 0,
      m: 0,
      y: 0,
      k: 0.949
    },
    name: "key"
  }];

  //These are the canvases on the page
  var source = document.getElementById('source');
  var target = document.getElementById('target');

  //pixelLoader is a promise that will populate pixels when the image loads. 
  //Pixels stores what's left of the image; pixelsToRender/nodeValues is a store of what the algo is drawing.
  var pixelLoader = Parser.getRGB(source, IMAGE_SOURCE);
  var pixels;
  var pixelsToRender, nodeValues;

  var timeoutFn = {};

  var connectNodes = function (origin, result, graph, thread) {
    graph.addEdge(origin, result.node, thread);
    graph.decrement(result.line, thread);
    Canvas.paint(pixelsToRender, origin, result.node, thread.render, graph);
    Canvas.putImage(target, pixelsToRender);
  };

  var continuousLine = function (graph, thread, level, start, end) {

    if (level === 0) {
      numLinesDrawn++;
      $('#count').text(numLinesDrawn);
      return continuousLine(graph, thread, MAX_RADIUS);
    }
    var result, scan1, scan2;

    if (start === undefined || end === undefined) {
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
      connectNodes(start, scan1, graph, thread);
      timeoutFn[thread.name] = setTimeout(function () {
        continuousLine(graph, thread, level, scan1.node, end);
      }, 1);
      return;
    }

    scan2 = graph.scanRadius(end, thread, level);
    if (scan2.node !== undefined) {
      connectNodes(end, scan2, graph, thread);
      timeoutFn[thread.name] = setTimeout(function () {
        continuousLine(graph, thread, level, scan2.node, end);
      }, 1);
      return;
    }
    timeoutFn[thread.name] = setTimeout(function () {
      continuousLine(graph, thread, level - 1, start, end);
    }, 1);
    return;

  };

  var cleanRender = function (canvas, graph) {
    var newData = Canvas.newImageData(canvas, graph.imageWidth, graph.imageHeight,
      255);
    var modifiedData = graph.cleanRenderNodes(newData);
    Canvas.putImage(canvas, modifiedData);
    pixelsToRender = modifiedData;
  };

  var init = function (graph) {
    continuousLine(graph, threads[0], MAX_RADIUS);
    continuousLine(graph, threads[1], MAX_RADIUS);
    continuousLine(graph, threads[2], MAX_RADIUS);
    continuousLine(graph, threads[3], MAX_RADIUS);
    // continuousLine(graph, threads[4], MAX_RADIUS);

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

    $('#clean').click(function () {
      cleanRender(target, graph);
    });

    $('#step').click(function () {
      graph.nodeStep(pixels);
      cleanRender(target, graph);
    });

    init(graph);
    // init(graph);

  });

});