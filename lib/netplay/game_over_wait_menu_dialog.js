goog.provide('three7.netplay.GameOverWaitMenuDialog');
goog.require('three7.controls.Dialog');

/**
 * Class that implements Three7's pause menu dialog.
 */
three7.netplay.GameOverWaitMenuDialog = function(onReturn) {
  var self = this, resumeButton, quitButton;

  goog.base(this, 0.7, 0.4, three7.i18n.t('netPlay.pleaseWait'));

  this.enabled = true;

  // message label
  this.label = new lime.Label(three7.i18n.t('netPlay.waitingOpponent'));
  this.label.setFontFamily('Arial');
  this.label.setFontColor('#fff').setFontSize(30);
  this.label.setShadow('#000', 2, 1, 2);
  this.label.setPositionFromSize(0, -0.5);
  this.appendChild(this.label);

  // force quit button
  quitButton = this.createButton('forceQuit', function() {
    var scene;
    if (self.enabled) {
      self.enabled = false;
      onReturn();
      scene = new three7.MainMenuScene();
      three7.director.replaceScene(scene, lime.transitions.SlideInDown, 1);
    }
  }, 0, 0.11);
  this.appendChild(quitButton);
};

goog.inherits(three7.netplay.GameOverWaitMenuDialog, three7.controls.Dialog);

/**
 * Create button
 */
three7.netplay.GameOverWaitMenuDialog.prototype.createButton = function(key, click, x, y) {
  var button = new three7.controls.Button(click,
      three7.i18n.t('netPlay.' + key), x, y, three7.WIDTH * 0.45);
  return button;
};
