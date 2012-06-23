goog.provide('three7.game.HowToPlayScene');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Sprite');
goog.require('lime.Label');
goog.require('goog.events');
goog.require('three7.i18n');

/**
 * Class that implements Three7's how to play scene.
 */
three7.game.HowToPlayScene = function(onDone) {
  goog.base(this);

  // callback for when explanation is over
  this.onDone = onDone;

  this.screens = [];
  this.screens.push({ title : 'three7', text : 'falling_blocks_game', image : 'howto1' });
  this.screens.push({ title : 'rules', text : 'blocks_1_to_7', image : 'howto1' });
  this.screens.push({ title : 'rules', text : 'sum_7', image : 'howto2' });
  this.screens.push({ title : 'rules', text : 'sum_7', image : 'howto3' });
  this.screens.push({ title : 'rules', text : 'clear_777', image : 'howto4' });
  this.screens.push({ title : 'controls', text : 'tap_to_rotate', image : 'howto5' });
  this.screens.push({ title : 'controls', text : 'tap_to_rotate', image : 'howto6' });
  this.screens.push({ title : 'controls', text : 'slide_left_right', image : 'howto7' });
  this.screens.push({ title : 'controls', text : 'push_down_to_fall', image : 'howto8' });

  this.screenIndex = 0;

  // if there is a tap/click event, go to the next screen
  goog.events.listen(this, ['mousedown', 'touchstart'], function(e) {
    if (!this.enableNextScreen) {
      return;
    }
    this.enableNextScreen = false;
    this.nextScreen();
  }, false, this);
  this.enableNextScreen = false;
  this.nextScreen();
};

goog.inherits(three7.game.HowToPlayScene, lime.Scene);

/**
 * Create current screen.
 */
three7.game.HowToPlayScene.prototype.createScreen = function() {
  var screen, titleLabel, textLabel, imageSprite, pos, wrapWidth, lineCount;
  
  screen = this.screens[this.screenIndex];
  this.screen = new lime.Layer();

  // title
  titleLabel = three7.i18n.t('howToPlay.' + screen.title);
  titleLabel = this.createLabel(titleLabel, 50, 0.07, '#000', '#fff');
  this.screen.appendChild(titleLabel);

  // image
  imageSprite = new lime.Sprite();
  imageSprite.setFill(three7.getAtlasFrame(screen.image + '.png'));
  imageSprite.setPositionFromScreen(0.5, 0.5);
  this.screen.appendChild(imageSprite);

  // explanation 
  wrapWidth = three7.WIDTH * 0.95;
  textLabel = three7.i18n.t('howToPlay.' + screen.text);
  textLabel = this.createLabel(textLabel, 40, 0, '#fff', '#000');
  pos = imageSprite.getPosition().y - imageSprite.getSize().height * 0.5;
  lineCount = Math.ceil(textLabel.measureText().width / wrapWidth);
  textLabel.setPositionFromSize(0, -lineCount - 0.5, three7.WIDTH * 0.5, pos);
  textLabel.setSize(wrapWidth, 0);
  this.screen.appendChild(textLabel);
  this.screen.setOpacity(0.01);

  this.appendChild(this.screen);
};


/**
 * Create default label.
 */
three7.game.HowToPlayScene.prototype.createLabel = function(text, fontSize, y, color, shadow) {
  var label = new lime.Label(text).setFontFamily('Arial');
  label.setFontColor(color).setFontSize(fontSize);
  label.setPositionFromScreen(0.5, y);
  label.setShadow(shadow, 2, 1, 2);
  return label;
};

/**
 * Show next screen.
 */
three7.game.HowToPlayScene.prototype.nextScreen = function() {
  var self = this;
  // hide current screen
  if (this.screen) {
    this.screen.hide(function() {
      self.removeChild(self.screen);
      self.screen = null;
      ++self.screenIndex;
      self.nextScreen();
    });
  }
  // show next screen
  else if (this.screenIndex < this.screens.length) {
    this.createScreen();
    this.screen.appear(function() {
      self.enableNextScreen = true;
    });
  }
  // no more screens
  else {
    this.onDone();
  }
};
