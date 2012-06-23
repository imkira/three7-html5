/**
 * Class that implements the match result.
 */
function MatchResult(data) {
  this.state = data.state;
  this.score = data.score;
  this.timeLeft = data.timeLeft;
}

/**
 * Compare this result against another.
 */
MatchResult.prototype.compareTo = function(other) {
  // same state?
  if (other.state === this.state) {
    // decide by time left
    if (other.timeLeft > this.timeLeft) {
      return 1;
    }
    if (other.timeLeft < this.timeLeft) {
      return -1;
    }
    // decide by score
    return this.score - other.score;
  }
  if ((this.state === 'playing') || (other.state === 'gameOver')) {
    return 1;
  }
  return -1;
};

/**
 * Check whether match result data is valid.
 */
MatchResult.isValid = function(data) {
  if ((!data) || (typeof data !== 'object')) {
    return false;
  }
  if ((!data.hasOwnProperty('state')) || (typeof data.state !== 'string')) {
    return false;
  }
  if ((data.state !== 'timeUp') &&
      (data.state !== 'gameOver') &&
      (data.state !== 'playing')) {
    return false;
  }
  if ((!data.hasOwnProperty('score')) || (typeof data.score !== 'number')) {
    return false;
  }
  if ((!data.hasOwnProperty('timeLeft')) || (typeof data.timeLeft !== 'number')) {
    return false;
  }
  return true;
};

module.exports = MatchResult;
