goog.provide('three7.storyplay.StoryScene');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Sprite');
goog.require('goog.events');
goog.require('three7.storyplay');

/**
 * Class that implements Three7's story scene.
 */
three7.storyplay.StoryScene = function(storyNumber, onDone) {
  goog.base(this);

  // callback for when story is over
  this.onDone = onDone;

  this.storyNumber = storyNumber;
  this.frames = three7.storyplay.STORY_FRAMES[storyNumber - 1];
  this.frameIndex = 0;
  this.frame = null;

  // if there is a tap/click event, go to the next frame
  goog.events.listen(this, ['mousedown', 'touchstart'], function(e) {
    if (!this.enableNextFrame) {
      if ((!this.frame) || (this.frame.getOpacity() < 0.4)) {
        return;
      }
    }
    this.enableNextFrame = false;
    this.nextFrame();
  }, false, this);
};

goog.inherits(three7.storyplay.StoryScene, lime.Scene);

/**
 * Start story sequence.
 */
three7.storyplay.StoryScene.prototype.start = function() {
  this.enableNextFrame = false;
  this.nextFrame();
};

/**
 * Create current frame.
 */
three7.storyplay.StoryScene.prototype.createFrame = function() {
  var frame, frameName;
  
  frame = this.frames[this.frameIndex];

  // set up frame for slide
  frameName = 'story' + this.storyNumber + '_' + (this.frameIndex + 1) + '.png';
  this.frame = new lime.Sprite();
  this.frame.setFill(three7.getAtlasFrame(frameName));
  this.frame.setPosition(frame.x, frame.y);
  this.frame.setOpacity(0.01);
  this.appendChild(this.frame);
};

/**
 * Show next frame.
 */
three7.storyplay.StoryScene.prototype.nextFrame = function() {
  var self = this;
  if (this.frame) {
    self.frame = null;
    ++self.frameIndex;
    self.nextFrame();
  }
  // show next frame
  else if (this.frameIndex < this.frames.length) {
    this.createFrame();
    this.frame.appear(function() {
      self.enableNextFrame = true;
    }, 1.5);
  }
  // no more frames
  else {
    this.onDone();
  }
};
