goog.provide('three7.netplay.Client');

/**
 * Class that implements Three7's socket.io client.
 */
three7.netplay.Client = function() {
  var self = this;

  this.playerData = null;
  this.loggedIn = false;
  this.opponentData = null;
  this.opponentScore = 0;
  this.questionPieces = 0;
  this.isOpponentPresent = false;
  this.matchResult = null;
  this.playerResult = null;

  this.now = goog.global.now;

  // ??? piece receive handler
  this.now.receivedQuestionPiece = function() {
    if (self.opponentData) {
      ++self.questionPieces;
    }
  };

  // opponent score update handler
  this.now.opponentScoreUpdated = function(player, score) {
    if ((player) && (self.opponentData) &&
        (player.nickName === self.opponentData.nickName)) {
      self.opponentScore = score;
    }
  };

  // player left match handler
  this.now.playerLeftMatch = function(player) {
    if ((player) && (self.opponentData) &&
        (player.nickName === self.opponentData.nickName)) {
      self.isOpponentPresent = false;
    }
  };

  // winner decided handler
  this.now.winnerDecided = function(player) {
    if (self.opponentData) {
      if (player) {
        if (player.nickName === self.opponentData.nickName) {
          self.matchResult = 'lose';
        }
        else {
          self.matchResult = 'win';
        }
      }
      else {
        self.matchResult = 'draw';
      }
    }
  };

  // report result back to server
  this.now.reportResult = function() {
    return self.playerResult;
  };
};

/**
 * Set player data.
 */
three7.netplay.Client.prototype.setPlayerData = function(playerData) {
  // re-log in only if necessary
  if ((this.playerData === null) ||
      (this.playerData.nickName != playerData.nickName) ||
      (this.playerData.color != playerData.color) ||
      (this.playerData.eyes != playerData.eyes) ||
      (this.playerData.face != playerData.face)) {
    this.playerData = playerData;
    this.loggedIn = false;
  }
};

/**
 * Set player result.
 */
three7.netplay.Client.prototype.setPlayerResult = function(result) {
  this.playerResult = result;
};

/**
 * Log in to server.
 */
three7.netplay.Client.prototype.logIn = function(callback, context) {
  var self = this;
  try {
    // already logged in?
    if (this.loggedIn) {
      // callback immediately
      callback.call(context, null);
      return;
    }

    // log in player
    this.now.login(this.playerData, function(error) {
      self.loggedIn = (error === null);
      callback.call(context, error);
    });
  }
  catch (e) {
    this.loggedIn = false;
    callback.call(context, 'connectionFailed');
  }
};

/**
 * Log out from server.
 */
three7.netplay.Client.prototype.logOut = function() {
  try {
    if (this.loggedIn) {
      this.loggedIn = false;
      this.now.logout();
    }
  }
  catch (e) {
  }
};

/**
 * Wait for match.
 */
three7.netplay.Client.prototype.waitMatch = function(callback, context) {
  var self = this;
  this.logIn(function(error) {
    // error logging in?
    if (error) {
      callback.call(context, null, error);
    }
    else {
      // wait for opponent
      self.now.findOpponent(function(opponentData, error) {
        self.loggedIn = (error === null);
        // problem with login?
        if (error === 'invalidData') {
          // force login
          self.waitMatch(callback, context);
        }
        else {
          self.opponentData = opponentData;
          self.opponentScore = 0;
          self.questionPieces = 0;
          self.isOpponentPresent = true;
          self.matchResult = null;
          callback.call(context, opponentData, error);
        }
      });
    }
  });
};

/**
 * Inform opponent that we got a 777 sequence and want to send a ??? piece.
 */
three7.netplay.Client.prototype.sendQuestionPiece = function() {
  try {
    this.now.sendQuestionPiece();
  }
  catch (e) {
  }
};

/**
 * Send an update of the player's score to the opponent.
 */
three7.netplay.Client.prototype.updateScore = function(score) {
  try {
    this.now.updateScore(score);
  }
  catch (e) {
  }
};

/**
 * Send an update of the player's result to the server.
 */
three7.netplay.Client.prototype.updateResult = function() {
  try {
    this.now.updateResult(this.playerResult);
  }
  catch (e) {
  }
};

/**
 * Get user count.
 */
three7.netplay.Client.prototype.userCount = function(callback) {
  try {
    this.now.userCount(callback);
  }
  catch (e) {
    callback(0);
  }
};
