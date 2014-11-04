var _; 

function ImageDrawer() {

  this.populateNodes = function(data, number) {
    var spacing, map, nodes, sqrt;
    //use spacing function, select the darkest nodes, w/ the exception of
    //a 5x5 radius (or sthing determined by size of img over number~like the area)
    
    //get the width and hight of the spacing
    spacing = Math.floor(data.pixels.length / number);
    sqrt = Math.floor(Math.sqrt(spacing));
    console.log(sqrt);
    //ok. lets try a diff approach. 
    //how about we find the maximums. It finds the max, then finds the next, and if its too
    //close to another, it skips it. 

    //lets first map the array to something that includes the original order
    map = _.map(data.pixels, function(val, index){
      return [index, val]
    });
    nodes = []

    while (nodes.length < number){
      map = mapMaxToNodes(map, nodes);
    }
    return nodes;

    function mapMaxToNodes (map, nodes) {
      var a = _.max(map, function(node){ 
        return node[1] 
      });
      map = _.partition(map, isAdjacent)[1];
      nodes.push(a);
      return map;

      function isAdjacent(val) {
        if (val[0] === a[0]) {
          return true
        } else if ( calculateAdjacency(a[0],val[0],spacing) ) {
          return true
        } else {
          return false;
        }
      }
    }

    function calculateAdjacency(index, index2, spacing) {
      switch(sqrt) {
        case 0: 
          return false;
        case 1:
          return false;
        case 2:
          if (Math.abs(index2 - index) < 2) {
            return true;
          } else {
            return false;
          }
        case 3:
          if (Math.abs(index2 - index) < 2) {
            return true;
          } else if (Math.abs(Math.abs(index2 - index) - data.width) < 2) {
            return true;
          } else {
            return false;
          }
        case 4:
          if (Math.abs(index2 - index) < 3) {
            return true
          } else if (Math.abs(Math.abs(index2 - index) - data.width) < 2) {
            return true
          } else if (Math.abs(Math.abs(index2 - index) - 2*data.width) < 2) {
            return true
          } else {
            return false;
          }
        case 5:
          if (Math.abs(index2 - index) < 3) {
            return true
          } else if (Math.abs(Math.abs(index2 - index) - data.width) < 3) {
            return true
          } else if (Math.abs(Math.abs(index2 - index) - 2*data.width) < 3) {
            return true
          } else {
            return false;
          }
        case 6:
          if (Math.abs(index2 - index) < 4) {
            return true
          } else if (Math.abs(Math.abs(index2 - index) - data.width) < 3) {
            return true
          } else if (Math.abs(Math.abs(index2 - index) - 2*data.width) < 3) {
            return true
          } else if (Math.abs(Math.abs(index2 - index) - 3*data.width) < 3) {
            return true
          } else {
            return false;
          }
        case 7:
          if (Math.abs(index2 - index) < 4) {
            return true
          } else if (Math.abs(Math.abs(index2 - index) - data.width) < 4) {
            return true
          } else if (Math.abs(Math.abs(index2 - index) - 2*data.width) < 4) {
            return true
          } else if (Math.abs(Math.abs(index2 - index) - 3*data.width) < 4) {
            return true
          } else {
            return false;
          }
        default:
          return false;

      }
      //first try gross before adjusting for edges
      //e.g. pixel 121 and 147
      //pixel math: first ring is 9, 16, 25, 

      //can hardcode for 1-10 circles, then just say not adjacent.
      //100 pixels is prolly enough resolution. 

    }

    

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