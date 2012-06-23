goog.provide('three7.game');

/**
 * Grid width in piece block units.
 */
three7.game.GRID_WIDTH = 7;

/**
 * Grid height in piece block units.
 */
three7.game.GRID_HEIGHT = 14;

/**
 * Size of a block in pixel units.
 */
three7.game.BLOCK_SIZE = 50;

/**
 * Size of a "next" block in pixel units.
 */
three7.game.NEXT_BLOCK_SIZE = 35;

/** Minimum number of digits in the score
 *
 */
three7.game.SCORE_MIN_DIGITS = 7;

/**
 * Max touch drag interval of a piece.
 */
three7.game.MIN_DRAG_INTERVAL = 10;

/**
 * Max tap time before enabling falling.
 */
three7.game.MIN_FALL_TAP_TIME = 500;

/**
 * Minimum drag offset in order to enter dragging mode immediatelly.
 */
three7.game.MIN_DRAG_OFFSET = 3;

/**
 * Max fall interval (level) of piece.
 */
three7.game.MAX_FALL_INTERVAL = 30;

/**
 * Time limit for each play mode.
 */
three7.game.TIME_LIMIT = {
  'storyPlay' : 180,
  'netPlay' : 120
};
