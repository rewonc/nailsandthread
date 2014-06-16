var _; /*globals*/

function ImageDrawer() {

  this.populateNodes = function(data, number) {
    //use spacing function, select the darkest nodes, w/ the exception of
    //a 5x5 radius (or sthing determined by size of img over number~like the area)
    num = Math.floor(Math.random()*(data.pixels.length));
    data.nodes.push(num);
    return data;
  }
  this.nextPt = function(data) {
    //need to assess, graphically, what makes the most sense.
    //node num 44. 
    //maybe for now we can try all pixels on the edge.
    //radiate in a spiral outward?
    console.log(data);
    return data;

    function radius (data, width, height) {
      //return the edgemost pixels
    }
    function line (no1, no2, width, height) {
      //return the pixels in between two lines
    }
  }
}


/*
Data structure for ddraw:

datadraw.array is just values:
[1, 2, 5, 15, 13] .. ad infinitum

datadraw.nodes can be index points: 
[18, 42, 8, 323]

datadraw.lines can be pairs of index points
[[1, 2], [3, 4]]


/// I like the idea of first getting all the nodes, then drawing maximal lines
from a node, then sorting out how to do it later.

/// Should be able to choose all the nodes upfront. No need to be shy about it.
  #how to check that it will be solvable? 
  #has to do with convexity of shapes...

///alteratively, we can have a "spacing" function, then just choose the top 
//30 points. Once you choose one, it eliminates points within 5x5 pixel radius
of itself. 

/// After choosing nodes, we can draw the lines in order of most needed?
/// Maybe starting the other way is better. See the lightest points. If only 2-3 lines
/// can go through a pt, check which 

Then fxns build on that.


*/