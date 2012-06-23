goog.provide('three7.game.Piece');
goog.require('goog.math');
goog.require('goog.array');
goog.require('three7.game');
goog.require('three7.game.Block');

/**
 * Class that implements a Three7's piece.
 */
three7.game.Piece = function(logic, label) {
  var blockSum;

  this.logic = logic;

  // draw random piece from bag if none is passed
  this.label = label || logic.drawPiece();
  this.type = three7.game.Piece.TYPES[this.label];

  // top left column for the piece
  this.squareSize = this.type[0].length;
  this.position = {
    x : Math.floor((three7.game.GRID_WIDTH - this.squareSize) / 2),
    y : 0
  };

  // create blocks
  this.rotation = 0;
  this.blocks = [];
  this.forEachBlockDefinition(0, function(x, y, blockIndex) {
    var position = { x : this.position.x + x, y : this.position.y + y };
    this.blocks.push(new three7.game.Block(logic, blockIndex, position));
  }, this);
};

/**
 * Piece types
 */
three7.game.Piece.TYPES = {
  I : ['   ', ' 0 ', '   ', ' 2 ',
       '012', ' 1 ', '210', ' 1 ',
       '   ', ' 2 ', '   ', ' 0 '],
  L : ['0 ', '10', '21', ' 2',
       '12', '2 ', ' 0', '01'],
  J : [' 0', '1 ', '21', '02',
       '12', '20', '0 ', ' 1'],
  i : ['  ', '0 ', '10', ' 1',
       '01', '1 ', '  ', ' 0']
};

/**
 * Get definition of every block for given rotation.
 */
three7.game.Piece.prototype.forEachBlockDefinition = function(rotation, visit, ctx) {
  var x, y, blockIndex;
  for (y = 0; y < this.squareSize; ++y) {
    for (x = 0; x < this.squareSize; ++x) {
      blockIndex = this.type[rotation + y * 4][x];
      if (blockIndex != ' ') {
        if (visit.apply(ctx, [x, y, parseInt(blockIndex, 10)]) === false) {
          return false;
        }
      }
    }
  }
  return true;
};

/**
 * Get block with given index.
 */
three7.game.Piece.prototype.blockWithIndex = function(index) {
  return goog.array.find(this.blocks, function(block) {
    return (block.index == index);
  });
};

/**
 * Unset piece blocks from grid.
 */
three7.game.Piece.prototype.unsetFromGrid = function() {
  goog.array.forEach(this.blocks, function(block) {
    block.unsetFromGrid();
  }, this);
};

/**
 * Set piece blocks to grid.
 */
three7.game.Piece.prototype.setToGrid = function() {
  goog.array.forEach(this.blocks, function(block) {
    block.setToGrid();
  }, this);
};

/**
 * Calculate the real mid/center position of the piece.
 */
three7.game.Piece.prototype.realCenterPosition = function() {
  var x = 0, y = 0;
  goog.array.forEach(this.blocks, function(block) {
    x += block.position.x;
    y += block.position.y;
  }, this);
  x /= this.blocks.length;
  y /= this.blocks.length;
  return { x : x, y : y };
};

/**
 * Calculate the mid/center position of the piece.
 */
three7.game.Piece.prototype.centerPosition = function() {
  var pos = this.realCenterPosition();
  return { x : Math.ceil(pos.x), y : Math.ceil(pos.y) };
};

/**
 * Check whether piece can occupy the specified offset.
 */
three7.game.Piece.prototype.canOccupyOffset = function(x, y) {
  // all blocks must be able to occupy offset
  return goog.array.every(this.blocks, function(block) {
    return block.canOccupyOffset(x, y);
  }, this);
};

/**
 * Check whether piece can move in the grid by a given offset.
 */
three7.game.Piece.prototype.canBeMovedBy = function(x, y) {
  var offset, direction;
  // test whether piece can move horizontally
  direction = (x > 0) ? -1 : 1;
  for (offset = x; offset !== 0; offset += direction) {
    if (!this.canOccupyOffset(offset, 0))
    {
      return false;
    }
  }
  // test whether piece can move vertically
  direction = (y > 0) ? -1 : 1;
  for (offset = y; offset !== 0; offset += direction) {
    if (!this.canOccupyOffset(0, offset))
    {
      return false;
    }
  }
  return true;
};

/**
 * Try to move piece in the grid by a given offset.
 */
three7.game.Piece.prototype.tryMoveBy = function(x, y) {
  // unset blocks from grid before trying to move them
  this.unsetFromGrid();
  if (this.canBeMovedBy(x, y) === false) {
    // set blocks back to grid.
    this.setToGrid();
    return false;
  }
  // move and set blocks on grid
  goog.array.forEach(this.blocks, function(block) {
    block.moveBy(x, y);
    this.logic.grid.setBlock(block);
  }, this);
  this.position.x += x;
  this.position.y += y;
  return true;
};

/**
 * Check whether piece can rotate right.
 */
three7.game.Piece.prototype.canRotateTo = function(rotation) {
  // search for a block that cannot be rotated
  return this.forEachBlockDefinition(rotation, function(x, y, blockIndex) {
    var x2 = this.position.x + x, y2 = this.position.y + y, block;
    block = this.blockWithIndex(blockIndex);
    return ((block === null) || (block.canOccupy(x2, y2)));
  }, this);
};

/**
 * Rotate piece right.
 */
three7.game.Piece.prototype.tryRotateRight = function() {
  var rotation;
  // unset blocks from grid before trying to rotate them
  this.unsetFromGrid();
  // try every remaining rotation in order
  for (rotation = (this.rotation + 1) % 4; rotation != this.rotation;) {
    if (this.canRotateTo(rotation)) {
      break;
    }
    rotation = (rotation + 1) % 4;
  }
  if (rotation === this.rotation) {
    // set blocks back to grid.
    this.setToGrid();
    return false;
  }
  this.rotation = rotation;
  // rotate and set blocks on grid
  return this.forEachBlockDefinition(rotation, function(x, y, blockIndex) {
    var x2 = this.position.x + x, y2 = this.position.y + y, block;
    block = this.blockWithIndex(blockIndex);
    if (block !== null) {
      block.setPosition(x2, y2);
    }
    return true;
  }, this);
};
