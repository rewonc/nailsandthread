/*global document: true, Canvas: true, Parser: true, Graph: true */
$(function () {
  'use strict';
  //These are the canvases on the page
  var source = document.getElementById('source');
  var target = document.getElementById('target');

  //pixelLoader is a promise that will populate pixels when the image loads. Pixels stores what's left of the image; pixelsToRender is a store of what the algo is drawing.
  var pixelLoader = Parser.getRGB(source, 'img/400x400-dog.jpg');
  var pixels;
  var pixelsToRender, nodeValues;

  var threads = [
    {c: 10, m: 0, y: 0, k: 0, render: {c: 1, m: 0, y: 0, k: 0}, name: "cyan" },
    {c: 0, m: 10, y: 0, k: 0, render: {c: 0, m: 1, y: 0, k: 0}, name: "magenta" },
    {c: 0, m: 0, y: 10, k: 0, render: {c: 0, m: 0, y: 1, k: 0}, name: "yellow" },
    {c: 0, m: 0, y: 0, k: 10, render: {c: 0, m: 0, y: 0, k: 1}, name: "key" }
  ];

  var timeoutFn = {};

  var drawNextLine = function (graph, thread, previous) {
    var origin, result;
    if (previous === undefined) {
      origin = graph.getRandomNode();
    } else {
      origin = previous;
    }
    result = graph.walkToNearbyNode(origin, thread);
    if (result.node !== undefined) {
      graph.addEdge(origin, result.node);
      graph.decrement(result.line, thread);
      Canvas.paint(pixelsToRender, origin, result.node, thread.render, graph);
      timeoutFn[thread.name] = setTimeout(function () {
        drawNextLine(graph, thread, result.node);
      }, 10);
    } else {
      console.log("undefined result from node search");
      timeoutFn[thread.name] = setTimeout(function () {
        drawNextLine(graph, thread);
      }, 10);
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
      width: 40,
      height: 40
    });

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
    $('#render').click(function () {
      Canvas.putImage(target, pixelsToRender);
    });

    $('#nodes').click(function () {
      Canvas.renderNodes(target, nodeValues, graph);
    });

    init(graph);

  });

});