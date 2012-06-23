goog.provide('three7.controls.TextInput');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.events');

/**
 * Class that implements text input within the canvas.
 */
three7.controls.TextInput = function(text, x, y, w, h) {
  var topLeft, bottomRight;

  topLeft = three7.director.localToScreen(new goog.math.Coordinate(x, y));
  bottomRight = three7.director.localToScreen(new goog.math.Coordinate(x + w, y + h));

  // create div
  this.editorContainer = goog.dom.createDom('div', {
    style : 'position: absolute;' +
      'top: ' + topLeft.y + 'px;' +
      'left: ' + topLeft.x + 'px;' +
      'width: ' + Math.round(bottomRight.x - topLeft.x) + 'px;' +
      'height: ' + Math.round(bottomRight.y - topLeft.y) + 'px;'
  });
  goog.dom.insertSiblingAfter(this.editorContainer, three7.director.rootElement);

  // create input and append to div
  this.inputElement = null;
  this.createInput(text);
};

/**
 * Set focus on input text box
 */
three7.controls.TextInput.prototype.focus = function() {
  this.inputElement.focus();
};

/**
 * (Re)Create input element within div.
 */
three7.controls.TextInput.prototype.createInput = function(text) {
  if (this.inputElement) {
    goog.events.removeAll(this.inputElement);
    goog.dom.removeNode(this.inputElement);
  }

  // create text input
  this.inputElement = goog.dom.createDom('input', {
    type : 'text',
    style : 'width: 100%; height: 100%; font-family: Arial; font-size: 100%;',
    value : text
  });

  // append it to div
  this.editorContainer.appendChild(this.inputElement);

  // scroll page to top after focus is lost
  goog.events.listen(this.inputElement, 'blur', function() {
    three7.fixWindowScroll();
    // recreating input field fixes japanese input problems on IOS5
    this.createInput(this.text());
  }, false, this);
};

/**
 * Get text content typed in the control.
 */
three7.controls.TextInput.prototype.text = function() {
  return this.inputElement.value;
};

/**
 * Dispose of element
 */
three7.controls.TextInput.prototype.dispose = function() {
  goog.events.removeAll(this.inputElement);
  goog.dom.removeNode(this.editorContainer);
};
