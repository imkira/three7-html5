goog.provide('three7.netplay.WaitingMatchScene');
goog.require('lime.Scene');
goog.require('lime.Label');
goog.require('lime.Sprite');
goog.require('lime.transitions.SlideInUp');
goog.require('lime.transitions.SlideInDown');
goog.require('lime.scheduleManager');
goog.require('goog.events');
goog.require('three7.i18n');
goog.require('three7.game.Character');

/**
 * Class that implements Three7's waiting match screen scene.
 */
three7.netplay.WaitingMatchScene = function(playerData) {
  var self = this;

  goog.base(this);

  // question(?) character
  this.questionCharacter = new lime.Sprite();
  this.questionCharacter.setFill(three7.getAtlasFrame('face_question.png'));
  this.questionCharacter.setPositionFromScreen(0.5, 0.3);
  this.appendChild(this.questionCharacter);
  
  // progress 
  this.progressLabel = new lime.Label(three7.i18n.t('netPlay.waitingOpponent'));
  this.progressLabel.setFontColor('#000').setFontSize(40);
  this.progressLabel.setPositionFromScreen(0.5, 0.5);
  this.progressLabel.setShadow('#fff', 2, 1, 2);
  this.appendChild(this.progressLabel);

  // character for this player
  this.character = new three7.game.Character(playerData);
  this.character.setPositionFromScreen(0.5, 0.7);
  this.character.label = this.createNickNameLabel(playerData.nickName, 0, 0.15);
  this.character.appendChild(this.character.label);
  this.appendChild(this.character);

  // character for opponent
  this.character2 = null;

  // wait for opponent
  three7.client.setPlayerData(this.character.data);
  three7.client.setPlayerResult({
    'state' : 'playing',
    'score' : 0,
    'timeLeft' : three7.game.TIME_LIMIT['netPlay']
  });
  three7.client.waitMatch(function(opponentData, error) {
    if (error) {
      this.abortConnection(error);
    }
    else {
      this.playAgainst(opponentData);
    }
  }, this);

  // show user count
  three7.client.userCount(function(count) {
    if (typeof self.usersLabel === 'undefined') {
      self.usersLabel = new lime.Label(three7.i18n.t('netPlay.userCount', count));
      self.usersLabel.setFontColor('#000').setFontSize(20);
      self.usersLabel.setPositionFromScreen(0.5, 0.05);
      self.usersLabel.setShadow('#fff', 2, 1, 2);
      self.appendChild(self.usersLabel);
    }
  });
};

goog.inherits(three7.netplay.WaitingMatchScene, lime.Scene);

/**
 * Create label for nickname
 */
three7.netplay.WaitingMatchScene.prototype.createNickNameLabel = function(nickName, x, y) {
  var label = new lime.Label(nickName);
  label.setFontColor('#000').setFontSize(30);
  label.setShadow('#fff', 2, 1, 2);
  label.setPositionFromScreen(x, y);
  return label;
};

/**
 * Show "player VS. player" screen.
 */
three7.netplay.WaitingMatchScene.prototype.playAgainst = function(opponentData) {
  var opponentText;
  if (this.character2 === null) {
    this.removeChild(this.questionCharacter);

    // character for opponent
    this.character2 = new three7.game.Character(opponentData);
    this.character2.setPositionFromScreen(0.5, 0.3);
    opponentNickName = three7.i18n.t('netPlay.opponentNickName', opponentData.nickName);
    this.character2.label = this.createNickNameLabel(opponentNickName, 0, -0.15);
    this.character2.appendChild(this.character2.label);
    this.appendChild(this.character2);

    this.progressLabel.setText(three7.i18n.t('netPlay.vs'));

    lime.scheduleManager.callAfter(function() {
      var transition, scene;
      this.usersLabel = null;
      this.character.stop();
      scene = new three7.game.Scene('netPlay', this.character.data, this.character2.data);
      transition = three7.director.replaceScene(scene, lime.transitions.SlideInUp, 1);
      goog.events.listen(transition, 'end', function() {
        scene.start();
      });
    }, this, 3000);
  }
};

/**
 * Abort connection and go the the character selection screen
 */
three7.netplay.WaitingMatchScene.prototype.abortConnection = function(error) {
  this.progressLabel.setText(three7.i18n.t('netPlay.errors.' + error));

  lime.scheduleManager.callAfter(function() {
    var transition, scene;
    this.usersLabel = null;
    this.character.stop();
    scene = new three7.netplay.CharacterSelectionScene();
    transition = three7.director.replaceScene(scene, lime.transitions.SlideInDown, 1);
    goog.events.listen(transition, 'end', function() {
      scene.start();
    });
  }, this, 2000);
};
