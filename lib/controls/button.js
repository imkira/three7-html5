goog.provide('three7.controls.Button');
goog.require('lime.GlossyButton');
goog.require('lime.RoundedRect');
goog.require('goog.events');

/**
 * Class that implements a Three7's base button.
 */
three7.controls.Button = function(click, txt, x, y, w, h, context) {
  goog.base(this, txt);

  this.borderWidth = 4;
  this.setColor('#ff6600');
  this.setPositionFromScreen(x, y);
  this.setSize(w || 200, h || 80);

  goog.events.listen(this, ['mousedown', 'touchstart'], function(e) {
    e.event.stopPropagation();
    e.swallow(['mouseup', 'touchend', 'touchcancel'], function(e) {
      three7.fixWindowScroll();
      click.call(context);
    });
  });
};

goog.inherits(three7.controls.Button, lime.GlossyButton);

/**
 * Create button state
 */
three7.controls.Button.prototype.makeState_ = function() {
  var state = new lime.RoundedRect();
  state.setFill('#bb6600');
  state.setRadius(15);
  state.inner = new lime.RoundedRect().setRadius(15);
  state.label = new lime.Label();
  state.label.setFontFamily('Arial');
  state.label.setAlign('center');
  state.label.setFontColor('#eef');
  state.label.setFontSize(35);
  state.label.setSize(250, 35);
  state.label.setShadow('#000', 3, 0, 0);

  state.appendChild(state.inner);
  state.inner.appendChild(state.label);
  return state;
};

/**
 * Set button color for state.
 */
three7.controls.Button.prototype.setColor = function(clr) {
  clr = lime.fill.parse(clr);
  goog.array.forEach([this.upstate, this.downstate], function(s) {
    var c = (s == this.downstate) ? clr.clone().addBrightness(0.2) : clr;
    var c2 = c.clone().addBrightness(0.2);
    var grad = new lime.fill.LinearGradient();
    grad.setDirection(0, 1, 0, 0);
    grad.addColorStop(0, c2);
    grad.addColorStop(0.3, c);
    /*grad.addColorStop(0.55, c);
    grad.addColorStop(1, c2);*/
    s.inner.setFill(grad);
  }, this);
  return this;
};
