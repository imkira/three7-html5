goog.provide('three7.storyplay');

three7.storyplay.STORY_FRAMES = [
  [ { x : 320, y : 175 },
    { x : 320, y : 340 },
    { x : 207, y : 434 },
    { x : 433, y : 434 },
    { x : 320, y : 636 },
    { x : 320, y : 650 } ]
];

/**
 * Probability of rival getting a better score.
 */
three7.storyplay.RIVAL_SCORE_PROBABILITY = 0.05;

/**
 * Minimum number of points rival can get in one shot.
 */
three7.storyplay.RIVAL_SCORE_MIN = 7;
 
/**
 * Maximum number of points rival can get in one shot.
 */
three7.storyplay.RIVAL_SCORE_MAX = 14;
