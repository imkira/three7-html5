goog.provide('three7.game.GameOverMenuDialog');
goog.require('three7.controls.Dialog');
goog.require('three7.game.Character');
goog.require('three7.netplay.WaitingMatchScene');

/**
 * Class that implements Three7's game over menu dialog.
 */
three7.game.GameOverMenuDialog = function(reason, onReturn, scene) {
  var self = this, score, retryButton, quitButton;

  goog.base(this, 0.6, 0.73, three7.i18n.t('game.menu.' + reason));

  this.enabled = true;

  // character
  this.character = new three7.game.Character(scene.character.data);
  this.character.setPositionFromScreen(0, -0.14);
  this.appendChild(this.character);

  if (reason === 'win') {
    this.character.setHappy();
    this.character.stop();
  }
  else if (reason === 'lose') {
    this.character.setSad();
    this.character.stop();
  }

  // score label
  this.scoreLabel = scene.createLabel(three7.i18n.t('game.score'));
  this.scoreLabel.setFontSize(50);
  this.scoreLabel.setFontColor('#fff');
  this.scoreLabel.setShadow('#000', 2, 1, 2);
  this.scoreLabel.setPositionFromScreen(0, 0);
  this.appendChild(this.scoreLabel);

  // score value
  score = goog.string.padNumber(scene.character.targetScore, three7.game.SCORE_MIN_DIGITS);
  this.scoreValueLabel = scene.createLabel(score);
  this.scoreValueLabel.setFontWeight('bold');
  this.scoreValueLabel.setFontColor('#fff');
  this.scoreValueLabel.setShadow('#ff9900', 2, 1, 2);
  this.scoreValueLabel.setFontSize(50);
  this.scoreValueLabel.setPositionFromScreen(0, 0.06, -15);
  this.appendChild(this.scoreValueLabel);

  // retry button
  retryButton = this.createButton('menu.retry', function() {
    var nextScene;
    if (self.enabled) {
      self.enabled = false;
      self.character.stop();
      if (scene.mode === 'netPlay') {
        onReturn(true);
        nextScene = new three7.netplay.WaitingMatchScene(scene.character.data);
        three7.director.replaceScene(nextScene, lime.transitions.SlideInDown, 1);
      }
      else {
        onReturn(false);
      }
    }
  }, 0, 0.16);
  this.appendChild(retryButton);

  // back to title button
  quitButton = this.createButton('menu.backToTitle', function() {
    var scene;
    if (self.enabled) {
      self.enabled = false;
      onReturn(true);
      self.character.stop();
      scene = new three7.MainMenuScene();
      three7.director.replaceScene(scene, lime.transitions.SlideInDown, 1);
    }
  }, 0, 0.28);
  this.appendChild(quitButton);
};

goog.inherits(three7.game.GameOverMenuDialog, three7.controls.Dialog);

/**
 * Create button
 */
three7.game.GameOverMenuDialog.prototype.createButton = function(key, click, x, y) {
  var button = new three7.controls.Button(click,
      three7.i18n.t('game.' + key), x, y, three7.WIDTH * 0.45);
  return button;
};
