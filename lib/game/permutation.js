goog.provide('three7.QuickPerm');
goog.require('goog.array');

/**
 * Class that implements QuickPerm algorithm:
 * algorithm adapted from http://www.quickperm.org/quickperm.php
 */
three7.QuickPerm = function(a) {
  this.a = a.slice(0);
  this.n = this.a.length;
  this.p = Array(this.n);
  this.reset();
};

/**
 * Start a new random permutation sequence.
 */
three7.QuickPerm.prototype.reset = function() {
  var i;
  goog.array.shuffle(this.a);
  for (i = 0; i < this.n; i++) {
    this.p[i] = 0;
  }
  this.upperIndex = 0;
};

/**
 * Get next element in permutation (or undefined if last)
 */
three7.QuickPerm.prototype.next = function() {
  var lowerIndex, tmp;
  if (this.upperIndex === 0) {
    this.upperIndex = 1;
    return this.a.slice(0);
  }
  while (this.upperIndex < this.n) {
    if (this.p[this.upperIndex] < this.upperIndex) {
      lowerIndex = this.upperIndex % 2 * this.p[this.upperIndex];
      tmp = this.a[lowerIndex];
      this.a[lowerIndex] = this.a[this.upperIndex];
      this.a[this.upperIndex] = tmp;
      this.p[this.upperIndex]++;
      this.upperIndex = 1;
      return this.a.slice(0);
    }
    this.p[this.upperIndex] = 0;
    this.upperIndex++;
  }
  return undefined;
};
