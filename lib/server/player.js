/**
 * Class that implements the game player.
 */
function Player(data) {
  this.clientId = data.clientId;
  this.nickName = data.nickName;
  this.color = data.color;
  this.face = data.face;
  this.eyes = data.eyes;
}

/**
 * Check whether player is logged in.
 */
Player.prototype.isLoggedIn = function() {
  return Player.clientIds.hasOwnProperty(this.clientId);
};

/**
 * Check whether player is logged in.
 */
Player.prototype.isAvailable = function() {
  return !Player.nickNames.hasOwnProperty(this.nickName);
};

/**
 * Log in player.
 */
Player.prototype.logIn = function() {
  Player.clientIds[this.clientId] = this;
  Player.nickNames[this.nickName] = this;
};

/**
 * Log off player.
 */
Player.prototype.logOff = function() {
  delete Player.clientIds[this.clientId];
  delete Player.nickNames[this.nickName];
};

/**
 * Initialize Player class globally.
 */
Player.initialize = function() {
  // all currently logged in users
  Player.clientIds = {};
  Player.nickNames = {};
};

/**
 * Check whether player data is valid.
 */
Player.isValid = function(data) {
  if ((!data) || (typeof data !== 'object')) {
    return false;
  }
  if ((!data.hasOwnProperty('nickName')) || (typeof data.nickName !== 'string')) {
    return false;
  }
  if ((!data.nickName) || (data.nickName.length === 0)) {
    return false;
  }
  return true;
};

module.exports = Player;
