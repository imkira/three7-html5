goog.provide('three7.game.MessageDialog');
goog.require('lime.Label');
goog.require('three7.controls.Dialog');

/**
 * Class that implements Three7's game over menu dialog.
 */
three7.game.MessageDialog = function(title, message, button, onReturn) {
  var self = this, messageLabel, confirmButton;

  goog.base(this, 0.7, 0.5, title);

  this.enabled = true;

  // message label
  messageLabel = new lime.Label(message).setFontFamily('Arial');
  messageLabel.setFontSize(30);
  messageLabel.setFontColor('#fff');
  messageLabel.setShadow('#000', 2, 1, 2);
  messageLabel.setSizeFromScreen(0.6, 0.2);
  this.appendChild(messageLabel);

  // back to title button
  confirmButton = new three7.controls.Button(function() {
    var scene;
    if (self.enabled) {
      self.enabled = false;
      onReturn();
    }
  }, button, 0, 0.16, three7.WIDTH * 0.45);
  this.appendChild(confirmButton);
};

goog.inherits(three7.game.MessageDialog, three7.controls.Dialog);
