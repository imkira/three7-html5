goog.provide('three7.game.Character');
goog.require('lime.Layer');
goog.require('lime.Sprite');
goog.require('goog.math');
goog.require('three7.storage');

/**
 * Class that implements Three7's non-animated character layer.
 */
three7.game.Character = function(playerData) {
  goog.base(this);

  if (!playerData) {
    playerData = {
      nickName : three7.storage.getValue('character.nickName', ''),
      color : three7.storage.getValue('character.color', 'mike'),
      face : three7.storage.getValue('character.face', 1),
      eyes : three7.storage.getValue('character.eyes', 1)
    };
  }

  this.data = playerData;

  this.faceFill = null;
  this.face = new lime.Sprite();
  this.appendChild(this.face);
  this.eyesFill = null;
  this.eyes = new lime.Sprite();
  this.appendChild(this.eyes);

  this.expressTask = null;
  this.expression = null;
  this.minBlinkInterval = 3000;
  this.maxBlinkInterval = 6000;
  this.happinessInterval = 2000;
  this.sadnessInterval = 2000;
  this.blinkCount = 0;

  this.invalidate();
  this.rescheduleExpression(this.minBlinkInterval, this.maxBlinkInterval);
};

goog.inherits(three7.game.Character, lime.Layer);

/**
 * Start expressing oneself.
 */
three7.game.Character.prototype.start = function() {
  this.stop();
  this.rescheduleExpression(this.minBlinkInterval, this.maxBlinkInterval);
};

/**
 * Stop all expressions.
 */
three7.game.Character.prototype.stop = function() {
  if (this.expressTask)
  {
    lime.scheduleManager.unschedule(this.expressTask, this);
    this.expressTask = null;
  }
};

/**
 * Make character happy.
 */
three7.game.Character.prototype.setHappy = function() {
  this.stop();
  this.expression = 'joy';
  this.invalidate();
  this.rescheduleExpression(this.happinessInterval);
};

/**
 * Make character sad.
 */
three7.game.Character.prototype.setSad = function() {
  this.stop();
  this.expression = 'sad';
  this.invalidate();
  this.rescheduleExpression(this.sadnessInterval);
};

/**
 * Mark character dirty.
 */
three7.game.Character.prototype.invalidate = function() {
  var face, eyes;
  face = 'face_0' + this.data.face + '_' + this.data.color + '.png';
  if (this.expression)
  {
    eyes = 'eyes_0' + this.data.eyes + '_' + this.expression + '.png';
  }
  else
  {
    eyes = 'eyes_0' + this.data.eyes + '.png';
  }
  if (face != this.faceFill) {
    this.faceFill = face;
    this.face.setFill(three7.getAtlasFrame(face));
  }
  if (eyes != this.eyesFill) {
    this.eyesFill = eyes;
    this.eyes.setFill(three7.getAtlasFrame(eyes));
  }
};

/**
 * Animate character by updating its expressions.
 */
three7.game.Character.prototype.express = function() {
  var minDelay, maxDelay;
  if (this.expression === null) {
    this.expression = 'blink';
    minDelay = 80;
  }
  else if (this.expression === 'blink') {
    this.expression = null;
    ++this.blinkCount;
    if (this.blinkCount >= 2) {
      this.blinkCount = 0;
      minDelay = this.minBlinkInterval;
      maxDelay = this.maxBlinkInterval;
    }
    else {
      minDelay = 100;
    }
  }
  else if ((this.expression === 'joy') || (this.expression === 'sad')) {
    this.blinkCount = 0;
    this.expression = null;
    minDelay = this.happinessInterval;
  }
  this.invalidate();
  this.rescheduleExpression(minDelay, maxDelay);
};

/**
 * Reschedule expression callback.
 */
three7.game.Character.prototype.rescheduleExpression = function(min, max) {
  var self = this;
  this.expressTask = function() {
    self.express();
  };
  lime.scheduleManager.callAfter(this.expressTask, this, goog.math.uniformRandom(min, max || (min + 1))); 
};
