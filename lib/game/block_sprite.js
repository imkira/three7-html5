goog.provide('three7.game.BlockSprite');
goog.require('goog.math.Coordinate');
goog.require('lime.Sprite');

/**
 * Class that implements a Three7's block sprite.
 */
three7.game.BlockSprite = function(block, isQuestionPiece) {
  var image;

  goog.base(this);

  this.block = block;
  this.setAnchorPoint(0, 0);
  this.setSize(three7.game.BLOCK_SIZE, three7.game.BLOCK_SIZE);
  if (isQuestionPiece) {
    image = 'q';
  }
  else {
    image = block.number.toString();
  }
  this.setFill(three7.getAtlasFrame(image + '.png'));
  this.setHidden(true);
};

goog.inherits(three7.game.BlockSprite, lime.Sprite);

/**
 * Update sprite position to reflect the block position.
 */
three7.game.BlockSprite.prototype.updatePosition = function() {
  var pos = this.block.position;
  // change visibility of block when required
  if (pos.y < 2) {
    if (!this.getHidden()) {
      this.setHidden(true);
    }
    return;
  }
  if (this.getHidden()) {
    this.setHidden(false);
  }
  this.setPosition(three7.game.BLOCK_SIZE * pos.x,
                   three7.game.BLOCK_SIZE * (pos.y - 2));
};
