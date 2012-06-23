goog.provide('three7.game.Grid');
goog.require('three7.game');
goog.require('goog.array');

/**
 * Class that implements Three7 game block grid.
 */
three7.game.Grid = function() {
  this.clear();
};

/**
 * Clear (or instantiate) block grid.
 */
three7.game.Grid.prototype.clear = function() {
  var row, col;
  this.blocks = new Array(three7.game.GRID_HEIGHT);
  for (row = 0; row < three7.game.GRID_HEIGHT; ++row) {
    this.blocks[row] = new Array(three7.game.GRID_WIDTH);
    for (col = 0; col < three7.game.GRID_WIDTH; ++col) {
      this.blocks[row][col] = null;
    }
  }
};

/**
 * Check whether specified position is valid.
 */
three7.game.Grid.prototype.isValidAt = function(x, y) {
  return ((x >= 0) && ((x + 1) <= three7.game.GRID_WIDTH) &&
          (y >= 0) && ((y + 1) <= three7.game.GRID_HEIGHT));
};

/**
 * Get block on grid at position.
 */
three7.game.Grid.prototype.blockAt = function(x, y) {
  if (!this.isValidAt(x, y)) {
    return undefined;
  }
  return this.blocks[y][x];
};

/**
 * Set block at grid position.
 */
three7.game.Grid.prototype.setBlock = function(block) {
  this.blocks[block.position.y][block.position.x] = block;
};

/**
 * Unset block from grid position.
 */
three7.game.Grid.prototype.unsetBlock = function(block) {
  this.blocks[block.position.y][block.position.x] = null;
};
