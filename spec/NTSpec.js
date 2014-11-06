describe("Grid.helper.findSlope", function(){

  it("should return a properly formatted value", function(){
    var origin = {"row":200,"column":200};
    var next = {"row":300,"column":300};
    var res = Grid.helpers.findSlope(origin, next);
    expect(res).toEqual({start_with: "rows", increment: 1, slope: 1, count: 100})
  });

  it("should switch start_with", function(){
    var origin = {"row":200,"column":200};
    var next = {"row":200,"column":400};
    var res = Grid.helpers.findSlope(origin, next);
    var altorigin = {"row":200,"column":200};
    var altnext = {"row":400,"column":200};
    var altres = Grid.helpers.findSlope(altorigin, altnext);
    expect(res).toEqual({start_with: "columns", increment: 1, slope: 0, count: 200})
    expect(altres).toEqual({start_with: "rows", increment: 1, slope: 0, count: 200})
  });

  it("should be okay with directionality", function(){
    var origin = {"row":200,"column":200};
    var next = {"row":100,"column":100};
    var res = Grid.helpers.findSlope(origin, next);
    var altorigin = {"row":200,"column":200};
    var altnext = {"row":100,"column":300};
    var altres = Grid.helpers.findSlope(altorigin, altnext);
    expect(res).toEqual({start_with: "rows", increment: -1, slope: -1, count: 100})
    expect(altres).toEqual({start_with: "rows", increment: -1, slope: 1, count: 100})
  });
});

describe("RC/Pixel conversions", function(){

  it("Convert to RC should give expected value", function(){
    var first = Grid.helpers.convertToRC(1000, 50, 50);
    expect(first).toEqual({row: 20, column: 0});
  });

  it("RC to Pixel should give expected value", function(){
    expect(Grid.helpers.rcToPixels(20, 0, 50, 50)).toBe(1000);
  });

  it("Pixel to RC shoudl match RC to pixel 1", function(){
    var first = Grid.helpers.convertToRC(1000, 50, 50);
    expect(Grid.helpers.rcToPixels(first.row, first.column, 50, 50)).toEqual(1000);
  });

  it("Pixel to RC shoudl match RC to pixel 2", function(){
    var first = Grid.helpers.convertToRC(234, 200, 100);
    console.log("row:" + first.row);
    console.log("column:" + first.column);
    expect(Grid.helpers.rcToPixels(first.row, first.column, 200, 100)).toEqual(234);
  });


});
  
