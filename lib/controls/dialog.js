goog.provide('three7.controls.Dialog');
goog.require('lime.RoundedRect');
goog.require('lime.fill.LinearGradient');

/**
 * Class that implements a Three7's base dialog.
 */
three7.controls.Dialog = function(width, height, title) {
  var gradient;

  goog.base(this);

  this.setOpacity(0.0);

  // dialog frame
  this.setPosition(three7.WIDTH / 2, three7.HEIGHT / 2);
  this.setSize(three7.WIDTH * width, three7.HEIGHT * height);
  gradient = new lime.fill.LinearGradient();
  gradient.addColorStop(0, 0, 0, 0, 0.7);
  gradient.addColorStop(1, 0, 0, 0, 0.8);
  this.setFill(gradient);
  this.setRadius(40);

  // dialog title
  this.titleLabel = new lime.Label(title).setFontFamily('Arial');
  this.titleLabel.setFontColor('#fff').setFontSize(50);
  this.titleLabel.setPositionFromScreen(0, -height * 0.5, 0, this.titleLabel.getSize().height);
  this.titleLabel.setShadow('#000', 2, 1, 2);
  this.appendChild(this.titleLabel);
};

goog.inherits(three7.controls.Dialog, lime.RoundedRect);
