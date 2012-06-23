goog.provide('three7');
goog.require('lime.Node');
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.SpriteSheet');
goog.require('lime.parser.JSON');
goog.require('lime.animation.Event');
goog.require('lime.animation.FadeTo');
goog.require('lime.Label');
goog.require('lime.scheduleManager');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('three7.storage');
goog.require('three7.i18n');
goog.require('lime.ASSETS.images.json');
goog.require('three7.i18n.ja');
goog.require('three7.i18n.en');
goog.require('three7.netplay.Client');
goog.require('three7.MainMenu');

/**
 * Entrypoint function
 */
three7.start = function() {
  this.WIDTH = 640;
  this.HEIGHT = 832;
  this.ASSETS_VERSION = 7;

  // apply monkey patches
  this.applyMonkeyPatches();

  // enable storage
  three7.storage.initialize();

  // enable socket.io client
  three7.client = new three7.netplay.Client();

  // enable i18n
  three7.i18n.detectLanguage();

  // start game
  this.director = new lime.Director(document.body, this.WIDTH, this.HEIGHT);
  this.director.makeMobileWebAppCapable();

  // sprite sheet of images
  this.atlas = new lime.SpriteSheet('assets/images.png?' + three7.ASSETS_VERSION,
      lime.ASSETS['images'].json, lime.parser.JSON);

  if (!this.isLoaded()) {
    lime.scheduleManager.schedule(this.waitLoading, this);
  }
  else {
    this.startGame();
  }
};

/**
 * Monkey patch LimeJS with helpers.
 */
three7.applyMonkeyPatches = function() {
  // monkey patch LimeJS.
  lime.Node.prototype.setPositionFromSize = function(w, h, x, y) {
    var size = this.getSize();
    this.setPosition((x || 0) + w * size.width, (y || 0) + h * size.height);
    return this;
  };

  lime.Node.prototype.setPositionFromScreen = function(w, h, x, y) {
    this.setPosition((x || 0) + w * three7.WIDTH, (y || 0) + h * three7.HEIGHT);
    return this;
  };

  lime.Node.prototype.setSizeFromScreen = function(w, h, x, y) {
    this.setSize((x || 0) + w * three7.WIDTH, (y || 0) + h * three7.HEIGHT);
    return this;
  };

  lime.Node.prototype.appear = function(over, duration) {
    var appear = new lime.animation.FadeTo(1).setDuration(duration || 0.3).enableOptimizations();
    this.runAction(appear);
    if (over) {
      goog.events.listen(appear, lime.animation.Event.STOP, over);
    }
  };

  lime.Node.prototype.hide = function(over, duration) {
    var hide = new lime.animation.FadeTo(0).setDuration(duration || 0.3).enableOptimizations();
    this.runAction(hide);
    if (over) {
      goog.events.listen(hide, lime.animation.Event.STOP, over);
    }
  };
};

/**
 * Sprite sheet creation helper.
 */
three7.getAtlasFrame = function(frame) {
  return this.atlas.getFrame(frame);
};

/**
 * Create main button menu
 */
three7.createContextualButton = function(key, click, context) {
  var button = new three7.controls.Button(click,
      three7.i18n.t('menuButton.' + key), 0, 0, 0, 0, context);
  button.setSize(three7.WIDTH * 0.12, three7.WIDTH * 0.12);
  button.setPositionFromSize(-0.9, 0.65, three7.WIDTH, 0);
  return button;
};

/**
 * Reset window to 0,0 (useful if user taps address bar in IOS5 browser).
 */
three7.fixWindowScroll = function() {
  goog.global.window.scrollTo(0, 0);
};

/**
 * Start game.
 */
three7.startGame = function() {
  // remove loading message
  goog.dom.removeNode(goog.dom.getElement('loading'));

  // check if this is the first time playing the game
  if (three7.storage.getValue('firstTime', 2) === 2) {
    // load help screen
    var scene = new three7.game.HowToPlayScene(function() {
      three7.storage.setValue('firstTime', 3);
      scene = new three7.MainMenuScene();
      three7.director.replaceScene(scene, lime.transitions.Dissolve, 0.5);
    });
    three7.director.replaceScene(scene);
  }
  else {
    // load main menu scene directly
    this.director.replaceScene(new three7.MainMenuScene());
  }
};

/**
 * Check whether contents are fully loaded.
 */
three7.isLoaded = function() {
  return this.getAtlasFrame('logo.png').isProcessed();
};

/**
 * Show a simple loading screen while image data is not fully loaded.
 */
three7.waitLoading = function() {
  // finished loading?
  if (this.isLoaded()) {
    lime.scheduleManager.unschedule(this.waitLoading, this);
    this.startGame();
  }
};

goog.exportSymbol('three7.start', three7.start);
