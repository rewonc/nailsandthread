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

  it("RC to Pixel should accept color shift to RGB map", function(){
    expect(Grid.helpers.rcToPixels(20, 0, 50, 50, 0)).toBe(4000);
    expect(Grid.helpers.rcToPixels(20, 0, 50, 50, 2)).toBe(4002);
  });

  it("Pixel to RC shoudl match RC to pixel 1", function(){
    var first = Grid.helpers.convertToRC(1000, 50, 50);
    expect(Grid.helpers.rcToPixels(first.row, first.column, 50, 50)).toEqual(1000);
  });

  it("Pixel to RC shoudl match RC to pixel 2", function(){
    var first = Grid.helpers.convertToRC(234, 200, 100);
    expect(Grid.helpers.rcToPixels(first.row, first.column, 200, 100)).toEqual(234);
  });


});
  
describe("nodesAdjacentTo", function(){

  var grid33 = Grid.generate({width: 3, height: 3});
  var grid55 = Grid.generate({width: 5, height: 5});
  var grid77 = Grid.generate({width: 7, height: 7});
  var grid99 = Grid.generate({width: 9, height: 9});
  var grid1010 = Grid.generate({width: 10, height: 10});
  console.log("77");
  console.log(JSON.stringify(grid77));
  
  it("should start with grids of expected size", function(){
    expect(grid33.size).toBe(9);
    expect(grid77.size).toBe(49);
    expect(grid1010.size).toBe(100);
    expect(grid1010.size).toBe(grid1010.rows.length);
    expect(grid77.width).toBe(7);
  });

  it("should give the right amount of adjacent nodes for a center node", function(){
    //caution: r, c numbers go up to width -1, height - 1. So selecting 2, 2 in a 3x3 grid actually selects the last value.
    expect(Grid.helpers.nodesAdjacentTo(Grid.helpers.rcToPixels(3, 3, 7, 7), grid77, 1, null, true).length + 1).toBe(9);
    expect(Grid.helpers.nodesAdjacentTo(Grid.helpers.rcToPixels(1, 1, 3, 3), grid33, 1, null, true).length + 1).toBe(9);
  });

  it("should give the right amount of adjacent for a side node", function(){
    //caution: r, c numbers go up to width -1, height - 1. So selecting 2, 2 in a 3x3 grid actually selects the last value.
    expect(Grid.helpers.nodesAdjacentTo(Grid.helpers.rcToPixels(6, 3, 7, 7), grid77, 1, null, true).length + 1).toBe(6);
    expect(Grid.helpers.nodesAdjacentTo(Grid.helpers.rcToPixels(1, 2, 3, 3), grid33, 1, null, true).length + 1).toBe(6);
    expect(Grid.helpers.nodesAdjacentTo(Grid.helpers.rcToPixels(0, 5, 10, 10), grid1010, 3, null, true).length + 1).toBe(28);
  });

  it("should give the right amount of adjacent for a corner node", function(){
    //caution: r, c numbers go up to width -1, height - 1. So selecting 2, 2 in a 3x3 grid actually selects the last value.
    expect(Grid.helpers.nodesAdjacentTo(Grid.helpers.rcToPixels(6, 6, 7, 7), grid77, 1, null, true).length + 1).toBe(4);
    expect(Grid.helpers.nodesAdjacentTo(Grid.helpers.rcToPixels(0, 0, 3, 3), grid33, 1, null, true).length + 1).toBe(4);
    expect(Grid.helpers.nodesAdjacentTo(Grid.helpers.rcToPixels(0, 0, 10, 10), grid1010, 3, null, true).length + 1).toBe(16);
  });

});