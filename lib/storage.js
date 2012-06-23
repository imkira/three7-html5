goog.provide('three7.storage');
goog.require('goog.storage.Storage');
goog.require('goog.storage.mechanism.HTML5LocalStorage');

/**
 * Extend three7.storage with HTML5 Local Storage get, set and set methods.
 */
three7.storage.initialize = function() {
  three7.storage.mechanism = new goog.storage.mechanism.HTML5LocalStorage();
  three7.storage.storage = new goog.storage.Storage(three7.storage.mechanism);
};

/**
 * Get value from key.
 */
three7.storage.getValue = function(key, undefinedValue) {
  var value = three7.storage.storage.get(key);
  if (typeof value === 'undefined') {
    return undefinedValue;
  }
  return value;
};

/**
 * Set value on key.
 */
three7.storage.setValue = function(key, value) {
  three7.storage.storage.set(key, value);
};

/**
 * Remove key and corresponding value.
 */
three7.storage.removeValue = function(key) {
  three7.storage.storage.remove(key);
};
