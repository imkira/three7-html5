goog.provide('three7.game.PauseMenuDialog');
goog.require('three7.controls.Dialog');

/**
 * Class that implements Three7's pause menu dialog.
 */
three7.game.PauseMenuDialog = function(onReturn) {
  var self = this, resumeButton, quitButton;

  goog.base(this, 0.6, 0.4, three7.i18n.t('game.menu.title'));

  this.enabled = true;

  // resume button
  resumeButton = this.createButton('menu.resume', function() {
    if (self.enabled) {
      self.enabled = false;
      onReturn(false);
    }
  }, 0, -0.01);
  this.appendChild(resumeButton);

  // quit button
  quitButton = this.createButton('menu.quit', function() {
    var scene;
    if (self.enabled) {
      self.enabled = false;
      onReturn(true);
      scene = new three7.MainMenuScene();
      three7.director.replaceScene(scene, lime.transitions.SlideInDown, 1);
    }
  }, 0, 0.11);
  this.appendChild(quitButton);
};

goog.inherits(three7.game.PauseMenuDialog, three7.controls.Dialog);

/**
 * Create button
 */
three7.game.PauseMenuDialog.prototype.createButton = function(key, click, x, y) {
  var button = new three7.controls.Button(click,
      three7.i18n.t('game.' + key), x, y, three7.WIDTH * 0.45);
  return button;
};
