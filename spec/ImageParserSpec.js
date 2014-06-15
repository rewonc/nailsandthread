describe("ImageParser", function(){
  var parser, src;
  src = "img/17x33multistar.jpg";
  parser = new ImageParser(src);

  it("should be linked to DOM elements", function(){
    var canvas, img;
    canvas = document.getElementById('canvas');
    img = document.getElementById('image');
    expect(parser.domImage).toBe(undefined);
    expect(parser.domCanvas).toBe(undefined);
    parser.domLink();
    expect(parser.domImage).toBe(img);
    expect(parser.domCanvas).toBe(canvas);
  });

  it("should refresh the DOM image w/ image from itself", function(){
    parser.domImage.src = "invalid src"
    parser.imgPush();
    expect(parser.domImage.src).toBe(window.location.origin + '/' + src);
  });

  it("should redraw canvas according to image from itself", function(){
    parser.domCanvas.width = 100;
    parser.domCanvas.height = 100;
    expect(parser.domCanvas.width).toBe(100);
    parser.canvasPush();
    expect(parser.domCanvas.width).toBe(17);
  });

  it("should translate the data map to a simplified grayscale array", function(){
    //usually requires parser.drawCanvas(), which is called above
    var res, grayscale;
    res = parser.generateDataMap();
    grayscale = parser.grayscaleArray(res);
    expect(grayscale.array.length).toBe(561);
  });


  it("should reconvert grayscaleArray to canvas image and display", function(){
    //used to be a fn to simply display grayscale, as seen below...
    //var res = parser.drawCanvas();
    //var resNew = parser.redrawCanvas(res, parser.filterGrayscale);
    //expect(resNew['monoscale']).toEqual(true);
    var res, grayscale, newRes;
    res = parser.generateDataMap();
    grayscale = parser.grayscaleArray(res);
    newRes = parser.grayToDataMap(grayscale);
    expect(newRes.data.length).toBe(2244);
    parser.redrawCanvas(newRes);
  });


  describe("ImageDrawer", function(){

    var drawData;
    var drawData = parser.drawer.dataInit();

    it("should choose the first node point", function(){
      expect(res.nodes.length).toBe(0);
      res = parser.drawer.firstNode();
      expect(res.nodes.length).toBe(1);
    });

  });

});

  


/*
it("should calculate the ideal node points", function(){
    //draw them in red on the canvas?
    var res = parser.generateDataMap();
    var nodes = parser.calculateNodes(res, 30);
    expect(nodes.length).toEqual(30);
  });
*/
 //what's a functional approach here?
  //translate data map to single grayscale array
  //three data points: grayscale array, node array, line array
  //f1: given grayscale array and node array, calculate next best point, return pt
  //f2: given new point, node array, and line array,
    //add all new lines to line array
    //decrease points from grayscale array
    //add new point to node array
    //return all 
