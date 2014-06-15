describe("ImageParser", function(){
  var parser;
  src = "img/17x33multistar.jpg";
  parser = new ImageParser(src);

  it("should refresh the page's image tags", function(){
    var img;
    img = document.getElementById('image');
    img.src = "invalid src"
    parser.refreshPage();
    expect(img.src).toBe(window.location.origin + '/' + src);
  });

  it("should draw the canvas object according to the image size", function(){
    var canvas, res;
    canvas = document.getElementById('canvas');
    canvas.width = 100;
    canvas.height = 100;
    res = parser.drawCanvas();
    expect(canvas.width).toBe(17);
    expect(canvas.height).toBe(33);    
    expect(res.width).toBe(17);
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
    newRes = parser.grayToDataMap();
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
