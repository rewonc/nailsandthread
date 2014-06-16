describe("ImageParser init components", function(){
  var parser, src;
  src = "img/10x10circle.jpg";
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
    expect(parser.domCanvas.width).toBe(10);
  });

});

describe("ImageParser translate components", function(){

  var parser, src;
  src = "img/25x25star.jpg";
  parser = new ImageParser(src);

  it("should be able to be initiated with init fxn", function(){
      parser.initialize();
  });

  it("should translate the data map to a simplified grayscale array", function(){
    res = parser.pullDataMap();
    grayscale = parser.grayscaleArray(res);
    expect(grayscale.array.length).toBe(625);
  });


  it("should reconvert grayscaleArray to canvas image and display", function(){
    var res, grayscale, newRes;
    res = parser.pullDataMap();
    grayscale = parser.grayscaleArray(res);
    newRes = parser.grayToDataMap(grayscale);
    expect(newRes.data.length).toBe(2500);
    parser.pushToCanvas(newRes);
  });
});

describe("Integration w/ ImageDrawer components", function(){

  var parser, src, drawData;
  src = "img/17x33multistar.jpg";
  parser = new ImageParser(src);
  drawData = {};

  it("should initialize and add info to new drawData object", function(){
      parser.initialize();
      parser.pushDrawData(drawData);
      //this apparently needs to be put in an "it" block. it will run before 
      //everything else if its in the block above, and will run before DOM loads
  });

  it("should be able to pull grayscale array from canvas with one command", function(){
    expect(parser.pullGray().array.length).toBe(561);
  });

  it("should be able to push grayscale array to canvas with one command", function(){
    res = parser.pushGray(parser.pullGray());
    expect(res.data.length).toBe(2244);
  });

  it("should generate a list of optimal nodes", function(){
    expect(drawData.nodes.length).toBe(0);
    drawData = parser.drawer.populateNodes(drawData, 30);
    expect(drawData.nodes.length).toBe(30);
  });

  it("should calculate the top lines to draw", function(){
    drawData = parser.drawer.nextPt(drawData);
    expect(drawData.nodes.length).toBe(2);
  });

  it("should add a line, subtract from each px along the vector", function(){
    
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
