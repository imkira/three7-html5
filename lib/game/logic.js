goog.provide('three7.game.Logic');
goog.require('goog.math');
goog.require('goog.array');
goog.require('goog.events.EventTarget');
goog.require('three7.game');
goog.require('three7.game.Grid');
goog.require('three7.game.Piece');
goog.require('three7.QuickPerm');

/**
 * Class that implements the Three7's game logic.
 */
three7.game.Logic = function() {
  goog.base(this);

  this.gameOver = false;
  this.score = 0;
  this.chains = 0;
  this.chainsCurrent = 0;
  this.combo = 0;
  this.comboCurrent = 0;
  this.floatStepTime = 0;
  this.fallStepTime = 0;
  this.dragStepTime = 0;
  this.fallDownStepTime = 0;
  this.pieceColumnTarget = null;
  this.pieceFallDown = false;
  this.pieceRotation = false;
  this.piecePermutator = new three7.QuickPerm(['I', 'L', 'J', 'i']);
  this.pieceBag = [];
  this.piece = null;
  this.nextPiece = null;
  this.floating = [];
  this.cleared = [];
  this.clearing = false;
  this.blockPermutator = new three7.QuickPerm([1, 2, 3, 4, 5, 6, 7]);
  this.blockBag = [];
  this.grid = new three7.game.Grid();
  this.setLevel(0);
};

goog.inherits(three7.game.Logic, goog.events.EventTarget);

/**
 * Draw a random piece from the piece bag.
 */
three7.game.Logic.prototype.drawPiece = function() {
  return this.drawFromBag(this.pieceBag, this.piecePermutator);
};

/**
 * Draw a random block number from the block bag.
 */
three7.game.Logic.prototype.drawBlock = function() {
  return this.drawFromBag(this.blockBag, this.blockPermutator);
};

/**
 * Draw a random element from a permutator.
 */
three7.game.Logic.prototype.drawFromBag = function(bag, permutator) {
  var element = bag.pop(), nextElements;
  if (typeof element === 'undefined') {
    nextElements = permutator.next();
    if (typeof nextElements === 'undefined') {
      permutator.reset();
      bag.splice.apply(bag, [0, 0].concat(permutator.next()));
    }
    else {
      bag.splice.apply(bag, [0, 0].concat(nextElements));
    }
    element = bag.pop();
  }
  return element;
};

/**
 * Spawn a random piece (at the top of the grid).
 */
three7.game.Logic.prototype.trySpawnPiece = function() {
  var piece = this.nextPiece || new three7.game.Piece(this);
  if (!piece.canOccupyOffset(0, 0)) {
    return false;
  }
  this.piece = piece;
  this.nextPiece = new three7.game.Piece(this);
  this.piece.setToGrid();
  goog.array.forEach(this.piece.blocks, function(block) {
    this.dispatchEvent({ type : 'blockSpawned', block : block });
  }, this);
  this.dispatchEvent({ type : 'nextPieceGenerated', piece : this.nextPiece });
  return true;
};

/**
 * Invalidate piece position.
 */
three7.game.Logic.prototype.invalidatePiecePosition = function() {
  goog.array.forEach(this.piece.blocks, function(block) {
    if (block.isDirty) {
      this.dispatchEvent({ type : 'blockPositionChanged', block : block });
      block.isDirty = false;
    }
  }, this);
};

/**
 * Clear blocks.
 */
three7.game.Logic.prototype.clearBlocks = function() {
  var self = this, scored;
  if (this.cleared.length === 0) {
    return false;
  }
  if (!this.clearing) {
    this.clearing = true;
    // calculate score for this clear
    scored = goog.array.reduce(this.cleared, function(sum, block) {
      return sum + block.number;
    }, 0);
    this.score += scored; 
    ++this.chainsCurrent;
    this.comboCurrent += scored;
    this.dispatchEvent({ type : 'blocksCleared', blocks : this.cleared,
      scored : scored, combo : this.comboCurrent, chains : this.chainsCurrent,
      onCleared : function() {
      // reset state
      self.cleared = [];
      self.clearing = false;
    }});
    this.dispatchEvent({ type : 'scoreChanged', score : this.score });
    // new max chains?
    if (this.chainsCurrent > this.chains) {
      this.chains = this.chainsCurrent;
      this.dispatchEvent({ type : 'chainsChanged', chains : this.chains });
    }
    // new max combo?
    if (this.comboCurrent > this.combo) {
      this.combo = this.comboCurrent;
      this.dispatchEvent({ type : 'comboChanged', combo : this.combo });
    }
  }
  return true;
};

/**
 * Separate blocks into floating and non-floating states.
 */
three7.game.Logic.prototype.floatingAndNonFloating = function() {
  var lowToHigh, floating = [], nonFloating = [];
  // sort floating by Y in descending order
  goog.array.sort(this.floating, function(block1, block2) {
    return block2.position.y - block1.position.y;
  });
  // process blocks vertically from lowest to highest block.
  goog.array.forEach(this.floating, function(block) {
    var below;
    // block below is free (directly floating)?
    if (block.canOccupyOffset(0, 1)) {
      floating.push(block);
      return;
    }
    below = this.grid.blockAt(block.position.x, block.position.y + 1);
    // block below exists and is also floating (indirectly floating)?
    if ((typeof below !== 'undefined') && (goog.array.contains(floating, below))) {
      floating.push(block);
    }
    else {
      nonFloating.push(block);
    }
  }, this);
  return { floating : floating, nonFloating : nonFloating };
};

/**
 * Get sequence blocks generated by given blocks.
 */
three7.game.Logic.prototype.sequenceBlocks = function(blocks) {
  var sequences = [], blocks2;
  // get all sequence blocks with given input blocks
  goog.array.forEach(blocks, function(block) {
    blocks2 = block.sequenceBlocks();
    if (blocks2.length > 0) {
      sequences = sequences.concat(blocks2);
    }
  }, this);
  // remove duplicates
  goog.array.removeDuplicates(sequences);
  return sequences;
};

/**
 * Clear sequence blocks.
 */
three7.game.Logic.prototype.addClearBlocks = function(nonFloating) {
  var sequences;
  // temporarily remove floating from grid
  goog.array.forEach(this.floating, function(block) {
    block.unsetFromGrid();
  });
  // get all sequences generated by the non-floating blocks.
  sequences = this.sequenceBlocks(nonFloating);
  // clear all blocks that have a sequence
  goog.array.forEach(sequences, function(block) {
    block.unsetFromGrid();
    this.cleared.push(block);
  }, this);
  // restore floating to grid
  goog.array.forEach(this.floating, function(block) {
    block.setToGrid();
  });
  return sequences;
};

/**
 * Apply gravity to floating blocks.
 */
three7.game.Logic.prototype.applyGravityToFloating = function(deltaTime) {
  var blockStates, sequences;
  if (this.floating.length === 0) {
    return false;
  }
  this.floatStepTime += deltaTime;
  if (this.floatStepTime >= this.floatInterval) {
    this.floatStepTime -= this.floatInterval;
    // get which blocks are still floating and which are not anymore.
    blockStates = this.floatingAndNonFloating();
    this.floating = blockStates.floating;
    // clear sequences
    sequences = this.addClearBlocks(blockStates.nonFloating);
    // move all floating blocks down
    goog.array.forEach(this.floating, function(block) {
      block.unsetFromGrid();
      block.moveBy(0, 1);
      block.setToGrid();
      this.dispatchEvent({ type : 'blockPositionChanged', block : block });
    }, this);
    // for each block that has a sequence
    goog.array.forEach(sequences, function(block) {
      var y, block2 = block;
      // for all blocks standing on this block
      for (y = block.position.y - 1; block2; --y) {
        block2 = this.grid.blockAt(block.position.x, y);
        // add it to the array of floating blocks if not already
        if ((block2) && (!goog.array.contains(this.floating, block2))) {
          this.floating.push(block2);
        }
      }
    }, this);
  }
  return true;
};

/**
 * Enable piece rotation.
 */
three7.game.Logic.prototype.setPieceRotateRight = function() {
  this.pieceRotation = true;
};

/**
 * Rotate piece in the grid (if rotation is enabled).
 */
three7.game.Logic.prototype.applyPieceRotation = function() {
  if (this.pieceRotation) {
    this.pieceRotation = false;
    if (this.piece.tryRotateRight()) {
      this.invalidatePiecePosition();
    }
  }
};

/**
 * Set current piece column target.
 */
three7.game.Logic.prototype.setPieceColumnTarget = function(colum) {
  this.pieceColumnTarget = colum;
};

/**
 * Get current piece column target.
 */
three7.game.Logic.prototype.pieceColumn = function() {
  if (this.piece) {
    return this.piece.centerPosition().x;
  }
  return null;
};

/**
 * Drag piece horizontally in the grid.
 */
three7.game.Logic.prototype.tryDragPiece = function() {
  var offset;
  if (this.pieceColumnTarget === null) {
    return;
  }
  offset = this.pieceColumnTarget - this.piece.centerPosition().x;
  offset = goog.math.clamp(offset, -1, 1);
  if (offset === 0) {
    return;
  }
  if (this.piece.tryMoveBy(offset, 0)) {
    this.invalidatePiecePosition();
  }
};

/**
 * Drag piece in the grid (if dragging is in progress).
 */
three7.game.Logic.prototype.applyPieceDragging = function(deltaTime) {
  this.dragStepTime += deltaTime;
  if (this.dragStepTime >= three7.game.MIN_DRAG_INTERVAL) {
    this.dragStepTime -= three7.game.MIN_DRAG_INTERVAL;
    this.tryDragPiece();
  }
};

/**
 * Set fall down mode.
 */
three7.game.Logic.prototype.setPieceFallDown = function(fallDown) {
  this.pieceFallDown = fallDown;
};

/**
 * Make piece fall down in the grid.
 */
three7.game.Logic.prototype.applyPieceFallDown = function(deltaTime) {
  if (this.pieceFallDown) {
    this.fallDownStepTime += deltaTime;
    if (this.fallDownStepTime >= this.fallDownInterval) {
      this.fallDownStepTime -= this.fallDownInterval;
      if (this.piece.tryMoveBy(0, 1)) {
        this.invalidatePiecePosition();
      }
    }
  }
};

/**
 * Apply gravity to piece.
 */
three7.game.Logic.prototype.applyGravityToPiece = function(deltaTime) {
  this.fallStepTime += deltaTime;
  if (this.fallStepTime >= this.fallInterval) {
    this.fallStepTime -= this.fallInterval;
    // try to make piece fall
    if (this.piece.tryMoveBy(0, 1)) {
      this.invalidatePiecePosition();
    }
    else {
      // make piece blocks float at least until next step
      this.floating = this.piece.blocks.splice(0);
      this.piece = null;
    }
  }
};

/**
 * Set level and adjust fall speed.
 */
three7.game.Logic.prototype.setLevel = function(level) {
  this.level = level;
  this.fallInterval = Math.max(1, three7.game.MAX_FALL_INTERVAL - level) / 60 * 1000;
  this.fallDownInterval = this.fallInterval / 5;
  this.floatInterval = this.fallInterval / 3;
};

/**
 * Update logic (make piece fall, rotate, clear, etc.).
 */
three7.game.Logic.prototype.updateStep = function(deltaTime) {
  if (this.clearBlocks()) {
    return;
  }
  deltaTime = Math.min(deltaTime, 500);
  if (this.applyGravityToFloating(deltaTime)) {
    // reset timings and consume touch events
    this.fallStepTime = 0;
    this.dragStepTime = 0;
    this.fallDownStepTime = 0;
    this.pieceColumnTarget = null;
    this.pieceRotation = false;
    return;
  }
  // reset chain/combo totals
  this.chainsCurrent = 0;
  this.comboCurrent = 0;
  // reset floating step time
  this.floatStepTime = 0;
  if (this.piece === null) {
    if (!this.trySpawnPiece()) {
      // game over
      if (!this.gameOver) {
        this.gameOver = true;
        this.dispatchEvent({ type : 'gameOver', score : this.score });
      }
      return;
    }
  }
  // allow the piece to be rotated by the user
  this.applyPieceRotation();
  // allow piece to be dragged by the user
  this.applyPieceDragging(deltaTime);
  // allow piece to be dropped down by the user
  this.applyPieceFallDown(deltaTime);
  // try to make piece fall
  this.applyGravityToPiece(deltaTime);
};
