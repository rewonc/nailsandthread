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
    var canvas;
    canvas = document.getElementById('canvas');
    canvas.width = 100;
    canvas.height = 100;
    res = parser.drawCanvas();
    expect(canvas.width).toBe(17);
    expect(canvas.height).toBe(33);    
    expect(res.width).toBe(17);
  });

  it("should turn the image monoscale", function(){
    res = parser.drawCanvas();
    resNew = parser.redrawCanvas(res, parser.filterGrayscale);
    expect(resNew['monoscale']).toEqual(true);
  });

  it("should calculate the ideal node points", function(){
    //draw them in red on the canvas?
    res = parser.generateDataMap();
    var nodes = parser.calculateNodes(res, 30);
    expect(nodes.length).toEqual(30);
  });

});


/*

describe("Player", function() {
  var player;
  var song;

  beforeEach(function() {
    player = new Player();
    song = new Song();
  });

  it("should be able to play a Song", function() {
    player.play(song);
    expect(player.currentlyPlayingSong).toEqual(song);

    //demonstrates use of custom matcher
    expect(player).toBePlaying(song);
  });

  describe("when song has been paused", function() {
    beforeEach(function() {
      player.play(song);
      player.pause();
    });

    it("should indicate that the song is currently paused", function() {
      expect(player.isPlaying).toBeFalsy();

      // demonstrates use of 'not' with a custom matcher
      expect(player).not.toBePlaying(song);
    });

    it("should be possible to resume", function() {
      player.resume();
      expect(player.isPlaying).toBeTruthy();
      expect(player.currentlyPlayingSong).toEqual(song);
    });
  });

  // demonstrates use of spies to intercept and test method calls
  it("tells the current song if the user has made it a favorite", function() {
    spyOn(song, 'persistFavoriteStatus');

    player.play(song);
    player.makeFavorite();

    expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
  });

  //demonstrates use of expected exceptions
  describe("#resume", function() {
    it("should throw an exception if song is already playing", function() {
      player.play(song);

      expect(function() {
        player.resume();
      }).toThrowError("song is already playing");
    });
  });
});

*/
