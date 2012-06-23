/**
 * Handle three7 server/client communication API.
 */
exports.initialize = function(app) {
  var _, nowjs, everyone, Player, MatchResult;

  _ = require('underscore');
  nowjs = require('now');
  everyone = nowjs.initialize(app);
  Player = require('./player');
  Player.initialize();
  MatchResult = require('./match_result');

  /**
   * Call back (more) safely.
   */
  function safeCallBack(callback) {
    var args;
    if (typeof callback === 'function') {
      args = Array.prototype.slice.call(arguments);
      try {
        callback.apply(null, args.slice(1));
      }
      catch (e) {
        console.log('Error callback');
      }
    }
  }

  /**
   * Create match room for two players.
   */
  function createMatchRoom(player, opponent) {
    var matchRoom;
    matchRoom = 'match_' + opponent.user.clientId + '_' + player.user.clientId;
    nowjs.removeGroup(matchRoom);
    matchRoom = nowjs.getGroup(matchRoom);
    matchRoom.addUser(opponent.user.clientId);
    matchRoom.addUser(player.user.clientId);
    player.user.matchRoom = matchRoom.groupName;
    player.user.matchResult = null;
    opponent.user.matchRoom = matchRoom.groupName;
    opponent.user.matchResult = null;
    console.log('New Match: ' + player.user.player.nickName + ' vs. ' + opponent.user.player.nickName);
    // when a user leaves the room, the other player will be informed.
    matchRoom.on('leave', function() {
      var rest;
      if (this.user.player) {
        console.log('Left Match: ' + this.user.player.nickName);
        // tell opponent the other player left the room
        rest = matchRoom.exclude([this.user.clientId]);
        safeCallBack(rest.now.playerLeftMatch, this.user.player);
      }
    });
  }

  function quitAllGroups(ctx) {
    ctx.getGroups(function(groups) {
      // for each group
      _.each(groups, function(group) {
        if (group != 'everyone') {
          // leave it
          group = nowjs.getGroup(group);
          group.removeUser(ctx.user.clientId);
          group.count(function(count) {
            // remove it if count reaches 0
            if (count === 0) {
              nowjs.removeGroup(group.groupName);
            }
          });
        }
      });
    });
    delete ctx.user.matchRoom;
    delete ctx.user.matchResult;
    delete ctx.user.findOpponent;
  }

  /**
   * Call back for when a user connects to the server.
   */
  nowjs.on('connect', function() {
    console.log('Joined: ' + this.user.clientId);
  });

  /**
   * Call back for when a user disconnects from the server.
   */
  nowjs.on('disconnect', function() {
    var player;
    if (!this.user.player) {
      console.log('Left clientId: ' + this.user.clientId);
    }
    else {
      quitAllGroups(this);
      player = new Player(this.user.player);
      player.logOff();
      console.log('Left client: ' + player.nickName);
    }
  });

  /**
   * Get the user count.
   */
  everyone.now.userCount = function(callback) {
    safeCallBack(callback, Object.keys(Player.nickNames).length);
  };

  /**
   * Log in into the server
   */
  everyone.now.login = function(playerData, callback) {
    var player;
    if (!Player.isValid(playerData)) {
      console.log('Invalid login: ' + this.user.clientId);
      safeCallBack(callback, 'invalidData');
    }
    else {
      // already logged in? log off first
      if (this.user.player) {
        player = new Player(this.user.player);
        console.log('Log off: ' + player.nickName);
        quitAllGroups(this);
        // log off player
        player.logOff();
        delete this.user.player;
      }
      playerData.clientId = this.user.clientId;
      player = new Player(playerData);
      // is nickname available?
      if (player.isAvailable()) {
        // log in player
        player.logIn();
        this.user.player = playerData;
        safeCallBack(callback, null);
        console.log('Logged in: ' + player.nickName);
      }
      else {
        console.log('Player in use: ' + player.nickName);
        safeCallBack(callback, 'alreadyInUse');
      }
    }
  };

  /**
   * Find opponent player.
   */
  everyone.now.findOpponent = function(callback) {
    var self = this, waitRoom, player = this.user.player;
    if (player) {
      console.log("Find Opponent: " + player.nickName);
      waitRoom = nowjs.getGroup('wait');
      waitRoom.removeUser(this.user.clientId);
      // check all users in the waiting room
      waitRoom.getUsers(function(users) {
        var opponentClientId, opponent;
        // get an opponent?
        opponentClientId = _.find(users, function(clientId) {
          return (clientId != self.user.clientId);
        }, self);
        if (typeof opponentClientId !== 'undefined') {
          nowjs.getClient(opponentClientId, function() {
            // opponent logged in?
            if (this.user.player) {
              opponent = this;
              console.log("Opponent Found: " + opponent.user.player.nickName);
              // remove waiting host player
              waitRoom.removeUser(opponentClientId);
              // create a match room for the two players
              createMatchRoom(self, opponent);
              // call back players
              safeCallBack(callback, opponent.user.player, null);
              safeCallBack(opponent.user.findOpponent, player, null);
              delete opponent.user.findOpponent;
            }
          });
        }
        if (!opponent) {
          console.log("Opponent Not Found: " + player.nickName);
          // make player wait and remember the callback
          self.user.findOpponent = callback;
          waitRoom.addUser(self.user.clientId);
        }
      });
    }
    else {
      console.log('Invalid findOpponent: ' + this.user.clientId);
      safeCallBack(callback, null, 'invalidData');
    }
  };

  /**
   * Send a ??? piece to the opponent.
   */
  everyone.now.sendQuestionPiece = function() {
    var rest;
    if ((this.user.player) && (this.user.matchRoom)) {
      // send match update to opponent player
      rest = nowjs.getGroup(this.user.matchRoom).exclude([this.user.clientId]);
      safeCallBack(rest.now.receivedQuestionPiece);
    }
  };

  /**
   * Inform opponent about player's score update.
   */
  everyone.now.updateScore = function(score) {
    var rest;
    if ((this.user.player) && (this.user.matchRoom)) {
      // send match update to opponent player
      rest = nowjs.getGroup(this.user.matchRoom).exclude([this.user.clientId]);
      safeCallBack(rest.now.opponentScoreUpdated, this.user.player, score); 
    }
  };

  /**
   * Inform server about player's result (gameOver or timeUp).
   */
  everyone.now.updateResult = function(result) {
    var matchRoom, finishedPlayers, userCount, current, other, compareResult;
    if ((this.user.player) && (this.user.matchRoom) &&
        (!this.user.matchResult) && (MatchResult.isValid(result))) {
      // save current player's result
      this.user.matchResult = new MatchResult(result);
      // get results for opponent and player
      matchRoom = nowjs.getGroup(this.user.matchRoom);
      finishedPlayers = [];
      userCount = 0;
      matchRoom.getUsers(function(users) {
        // check if both player and opponent have finished the game
        _.each(users, function(clientId) {
          nowjs.getClient(clientId, function() {
            ++userCount;
            if (this.user.matchResult) {
              finishedPlayers.push(this.user);
            }
          });
        });
      });
      current = finishedPlayers[0];
      // player is alone and finished?
      if (userCount === 1) {
        // player wins
        safeCallBack(matchRoom.now.winnerDecided, current.player); 
      }
      else if (userCount === 2) {
        if (userCount === finishedPlayers.length) {
          other = finishedPlayers[1];
          // compare current result against the other result
          compareResult = current.matchResult.compareTo(other.matchResult);
          if (compareResult > 0) {
            // current wins
            safeCallBack(matchRoom.now.winnerDecided, current.player); 
          }
          else if (compareResult < 0) {
            // other wins
            safeCallBack(matchRoom.now.winnerDecided, other.player); 
          }
          else {
            // draw
            safeCallBack(matchRoom.now.winnerDecided, null); 
          }
        }
        else {
          // request all players to report their status
          safeCallBack(matchRoom.now.reportResult); 
        }
      }
    }
  };

  /**
   * Log out from the server.
   */
  everyone.now.logout = function(callback) {
    if (this.user.player) {
      player = new Player(this.user.player);
      console.log('Logged out: ' + player.nickName);
      quitAllGroups(this);
      player.logOff();
      delete this.user.player;
      safeCallBack(callback, null);
    }
    else {
      console.log('Invalid logout: ' + this.user.clientId);
      safeCallBack(callback, 'invalidData');
    }
  };
};
