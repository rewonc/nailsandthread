/*jslint devel:true, browser: true*/
/*global Promise: true*/

'use strict';
var _;

var Parser = {
  getRGB: function (canvas, url) {
    var img = new Image();
    var context = canvas.getContext('2d');
    var result = new Promise(function (resolve) {
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        resolve(context.getImageData(0, 0, canvas.width, canvas.height));
      };
    });
    img.src = url;
    return result;
  }
};

var Graph = function (data, options) {
  //data = imageData  in 640000 format
  //options is 40x40 or 1.6k format
  var i, len;
  this.nodes = [];
  this.edges = [];
  this.size = options.height * options.width; //1600
  this.width = options.width; //40
  this.height = options.height; //40
  for (i = 0, len = this.size; i < len; i++) {
    this.nodes[i] = null;
  }
  this.imageHeight = data.height; //400
  this.imageWidth = data.width; //400
  this.pixels = data.data; //640k format

  //for calculating next rows in subsequent functions
  this.heightRatio = this.imageHeight / this.height; //10
  this.widthRatio = this.imageWidth / this.width; //10

  if (this.pixels.length % this.size !== 0) {
    console.log("Graph / Image ratio uneven; choose a proportional ratio");
  }
  this.ratio = this.pixels.length / 4 / this.size; // 100
};


var Helpers = {
  RGBtoCMYK: function (red, green, blue) {
    var red1, green1, blue1, c, m, y, k;
    red1 = red / 255;
    green1 = green / 255;
    blue1 = blue / 255;
    k = 1 - Math.max(red1, green1, blue1);

    if (k === 1) {
      return {
        c: 0,
        m: 0,
        y: 0,
        k: 1
      };
    }

    c = (1 - red1 - k) / (1 - k);
    m = (1 - green1 - k) / (1 - k);
    y = (1 - blue1 - k) / (1 - k);
    return {
      c: c,
      m: m,
      y: y,
      k: k
    };
  },
  CMYKtoRGB: function (obj) {
    return {
      red: 255 * (1 - obj.c) * (1 - obj.k),
      green: 255 * (1 - obj.m) * (1 - obj.k),
      blue: 255 * (1 - obj.y) * (1 - obj.k),
    };
  },
  normalizeCMYK: function (obj, maxBlack) {
    var max = Math.max(obj.c, obj.m, obj.y);
    return {
      c: obj.c / max,
      m: obj.m / max,
      y: obj.y / max,
      k: obj.k / maxBlack
    };
  },
  convertToRC: function (point, width) {
    var row = Math.floor(point / width);
    return {
      row: row,
      column: point - width * row
    };
  },
  rcToIndex: function (row, column, width) {
    return (row * width) + column;
  },
  findSlope: function (origin, next) {
    var rowDiff = next.row - origin.row;
    var colDiff = next.column - origin.column;
    var startWith, increment, slope, count;
    if (Math.abs(rowDiff) >= Math.abs(colDiff)) {
      startWith = "rows";
      increment = rowDiff < 0 ? -1 : 1;
      slope = colDiff / rowDiff * increment;
      count = Math.abs(rowDiff);
    } else {
      startWith = "columns";
      increment = colDiff < 0 ? -1 : 1;
      slope = rowDiff / colDiff * increment;
      count = Math.abs(colDiff);
    }
    return {
      start_with: startWith,
      increment: increment,
      slope: slope,
      count: count
    };
  },
  nodesAdjacentTo: function (origin, graph, radius) {
    var i, j, rcPoint, arr;
    arr = [];
    rcPoint = Helpers.convertToRC(origin, graph.width);
    //lets say row10, column10
    for (i = rcPoint.row - radius; i <= rcPoint.row + radius; i++) {
      for (j = rcPoint.column - radius; j <= rcPoint.column + radius; j++) {
        if (!(i < 0 || j < 0 || i >= graph.height || j >= graph.width || (i ===
          rcPoint.row && j === rcPoint.column))) {
          arr.push(Helpers.rcToIndex(i, j, graph.width));
        }
      }
    }
    return _.shuffle(arr);
  }
};

Graph.prototype.getNodeValue = function (index) {
  //Iterate through the rectangle of pixels covered by each node

  //index is on 1600 scale
  if (this.nodes[index] !== null) {
    return this.nodes[index];
  }

  /* take simply the first pixel of the node as the correct value
  var convertedIndex, cmyk;
  convertedIndex = this.scaleToPixel(index);
  cmyk = Helpers.RGBtoCMYK(this.pixels[convertedIndex], this.pixels[convertedIndex + 1], this.pixels[convertedIndex + 2]);
  cmyk.c = cmyk.c * this.ratio;
  cmyk.m = cmyk.m * this.ratio;
  cmyk.y = cmyk.y * this.ratio;
  cmyk.k = cmyk.k * this.ratio;
  this.nodes[index] = cmyk;
  return cmyk;
  */

  //this takes the average of all the nodes  
  var i, j, height, jump, width, convertedIndex, acc;
  height = this.heightRatio;
  jump = this.imageWidth * 4;
  width = this.widthRatio * 4;
  convertedIndex = this.scaleToPixel(index);

  acc = {
    c: 0,
    m: 0,
    y: 0,
    k: 0
  };

  var addToAcc = function (index, ctx) {
    var cmyk = Helpers.RGBtoCMYK(ctx.pixels[index], ctx.pixels[index + 1],
      ctx.pixels[index + 2]);
    acc.c += cmyk.c;
    acc.m += cmyk.m;
    acc.y += cmyk.y;
    acc.k += cmyk.k;
  };

  for (i = 0; i < height; i++) {
    for (j = 0; j < width; j += 4) {
      addToAcc(convertedIndex + jump * i + j, this);
    }
  }
  this.nodes[index] = acc;
  return acc;

};

Graph.prototype.scaleToPixel = function (index) {
  var rc = Helpers.convertToRC(index, this.width);
  var row = rc.row * this.heightRatio;
  var column = rc.column * this.widthRatio;
  return Helpers.rcToIndex(row, column, this.imageWidth) * 4;
};

Graph.prototype.getMiddleNodes = function (first, second) {
  //Return an array of affected nodes & distance (num of pixels drawn) by a line draw operation between two nodes
  //first and second are integers
  var i;
  var width = this.width,
    rc1 = Helpers.convertToRC(first, width),
    rc2 = Helpers.convertToRC(second, width),
    slope = Helpers.findSlope(rc1, rc2);

  //slope in form: {"start_with":"rows","increment":1,"slope":0.6341463414634146,"count":410} 
  var res = [];

  if (slope.start_with === "rows") {
    for (i = 0; i < slope.count; i++) {
      res.push(Helpers.rcToIndex(rc1.row + (i * slope.increment), Math.floor(rc1.column + i * slope.slope), width));
    }
  } else {
    for (i = 0; i < slope.count; i++) {
      res.push(Helpers.rcToIndex(Math.floor(rc1.row + i * slope.slope), rc1.column +
        (i * slope.increment), width));
    }
  }
  return _.uniq(res);

};

Graph.prototype.getRandomNode = function () {
  return Math.floor(Math.random() * this.size);
};

Graph.prototype.walkToNearbyNode = function (origin, thread, radius) {
  var line;
  var edges = this.edges;
  var nodes = Helpers.nodesAdjacentTo(origin, this, radius);
  var context = this;
  var verified = _.find(nodes, function (index) {
    //check for existence of already drawn edge
    if (edges[origin] && edges[origin].indexOf(index) >= 0) {
      return false;
    }
    //check if all nodes in between have enough space
    line = context.getMiddleNodes(origin, index);
    return _.every(line, function (pixel) {
      var values = context.getNodeValue(pixel);
      return (
        values.k >= thread.k &&
        values.c >= thread.c &&
        values.m >= thread.m &&
        values.y >= thread.y
      );
    });
  });
  return {
    node: verified,
    line: line
  };
};

Graph.prototype.decrement = function (line, thread) {
  _.each(line, function (index) {
    this.nodes[index].c -= thread.c;
    this.nodes[index].k -= thread.k;
    this.nodes[index].m -= thread.m;
    this.nodes[index].y -= thread.y;
  }, this);
};

Graph.prototype.addEdge = function (pt1, pt2) {
  if (this.edges[pt1] === undefined) {
    this.edges[pt1] = [];
  }
  if (this.edges[pt2] === undefined) {
    this.edges[pt2] = [];
  }
  this.edges[pt1].push(pt2);
  this.edges[pt2].push(pt1);
};

var Canvas = {
  paint: function (pixels, pt1, pt2, thread, graph) {
    var rc1, rc2, RC1, RC2, slope, indices, i, width, rgb;
    width = pixels.width;
    rc1 = Helpers.convertToRC(pt1, graph.width);
    rc2 = Helpers.convertToRC(pt2, graph.width);
    RC1 = {
      row: rc1.row * graph.heightRatio,
      column: rc1.column * graph.widthRatio
    };
    RC2 = {
      row: rc2.row * graph.heightRatio,
      column: rc2.column * graph.widthRatio
    };
    slope = Helpers.findSlope(RC1, RC2);
    indices = [];

    if (slope.start_with === "rows") {
      for (i = 0; i < slope.count; i++) {
        indices.push(Helpers.rcToIndex(RC1.row + (i * slope.increment), Math.floor(RC1.column + i * slope.slope), width));
      }
    } else {
      for (i = 0; i < slope.count; i++) {
        indices.push(Helpers.rcToIndex(Math.floor(RC1.row + i * slope.slope),
          RC1.column +
          (i * slope.increment), width));
      }
    }
    rgb = Helpers.CMYKtoRGB(thread);

    _.each(_.uniq(indices), function (index) {
      var pos = index * 4;
      pixels.data[pos] = rgb.red;
      pixels.data[pos + 1] = rgb.green;
      pixels.data[pos + 2] = rgb.blue;

    });

  },
  newImageData: function (canvas, width, height, opacity) {
    var i;
    var context = canvas.getContext('2d');
    var imgdata = context.createImageData(width, height);
    for (i = 0; i < imgdata.data.length; i += 4) {
      imgdata.data[i] = 255;
      imgdata.data[i + 1] = 255;
      imgdata.data[i + 2] = 255;
      imgdata.data[i + 3] = opacity;
    }
    return imgdata;
  },
  renderNodes: function (canvas, data, graph) {
    //graph.nodes.len === 1600
    //data.data.len = 6400
    _.each(graph.nodes, function (val, index) {
      var cmyk = val || graph.getNodeValue(index); //index: 1600 scale
      var rgb = Helpers.CMYKtoRGB(Helpers.normalizeCMYK(cmyk, graph.ratio));
      var newIndex = index * 4; //newindex -> 6400 scale
      data.data[newIndex] = rgb.red;
      data.data[newIndex + 1] = rgb.green;
      data.data[newIndex + 2] = rgb.blue;
    });
    Canvas.putImage(canvas, data);
  },
  putImage: function (canvas, data) {
    canvas.width = data.width;
    canvas.height = data.height; //console.log('put image');
    var context = canvas.getContext('2d');
    context.putImageData(data, 0, 0);
  }
};