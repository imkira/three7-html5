goog.provide('three7.game.Scene');
goog.require('lime.animation.Event');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.Sequence');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.Label');
goog.require('lime.Layer');
goog.require('goog.math');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.events.KeyCodes');
goog.require('goog.string');
goog.require('three7.i18n');
goog.require('three7.game');
goog.require('three7.game.Logic');
goog.require('three7.game.BlockSprite');
goog.require('three7.game.Character');
goog.require('three7.game.PauseMenuDialog');
goog.require('three7.game.GameOverMenuDialog');
goog.require('three7.game.MessageDialog');
goog.require('three7.netplay.GameOverWaitMenuDialog');
goog.require('three7.controls.Button');

/**
 * Class that implements Three7's main game scene.
 */
three7.game.Scene = function(mode, playerData, opponentData) {
  var pos;

  goog.base(this);

  // create sprite for grid of blocks
  this.createGrid();

  // game mode
  this.mode = mode;

  // create character 1
  this.character = this.createCharacter(1, playerData);

  // create character 2
  if (opponentData) {
    this.character.setPositionFromScreen(0.12, 0.55);
    this.character2 = this.createCharacter(2, opponentData);
    this.character2.setPositionFromScreen(0.12, 0.25);
    // VS. in the middle
    this.vsLabel = this.createLabel(three7.i18n.t('netPlay.vs'));
    this.vsLabel.setFontSize(40);
    this.vsLabel.setFontWeight('bold');
    this.vsLabel.setPositionFromScreen(0.12, 0.40);
    this.appendChild(this.vsLabel);
  }
  else {
    this.character.setPositionFromScreen(0.12, 0.40);
    this.character2 = null;
  }

  this.isQuestionPiece = false;

  // is game paused?
  this.paused = false;
  this.gameOver = false;

  // no dialogs
  this.pauseMenuDialog = null;
  this.gameOverWaitMenuDialog = null;
  this.gameOverMenuDialog = null;

  // menu button
  this.menuButton = three7.createContextualButton('game', function() {
    var self = this;
    if (!this.paused) {
      this.setPaused(true);
      this.pauseMenuDialog = new three7.game.PauseMenuDialog(function(willQuit) {
        if (willQuit) {
          self.stop();
          if (self.mode === 'netPlay') {
            three7.client.logOut();
          }
        }
        else {
          self.pauseMenuDialog.hide(function() {
            self.setPaused(false);
            self.removeChild(self.pauseMenuDialog);
            self.pauseMenuDialog = null;
          });
        }
      });
      this.appendChild(this.pauseMenuDialog);
      this.pauseMenuDialog.appear();
    }
  }, this);
  this.appendChild(this.menuButton);

  // next blocks layer
  this.nextBlockLayer = this.createNextBlocksLayer();

  // chains  label
  pos = this.nextBlockLayer.getPosition();
  this.chainsLabel = this.createLabel(three7.i18n.t('game.chains'));
  this.chainsLabel.setPosition(pos.x, pos.y + three7.game.NEXT_BLOCK_SIZE * 4);
  this.appendChild(this.chainsLabel);

  // chains
  this.chains = 0;

  // chains value label
  pos = this.chainsLabel.getPosition();
  this.chainsValueLabel = this.createLabel(this.chains.toString());
  this.chainsValueLabel.setFontWeight('bold');
  this.chainsValueLabel.setPositionFromSize(0, 1, pos.x, pos.y);
  this.appendChild(this.chainsValueLabel);

  // combo label
  pos = this.chainsValueLabel.getPosition();
  this.comboLabel = this.createLabel(three7.i18n.t('game.combo'));
  this.comboLabel.setPositionFromSize(0, 2, pos.x, pos.y);
  this.appendChild(this.comboLabel);

  // combo
  this.combo = 0;
  this.targetCombo = 0;

  // combo value label
  pos = this.comboLabel.getPosition();
  this.comboValueLabel = this.createLabel(this.combo.toString());
  this.comboValueLabel.setFontWeight('bold');
  this.comboValueLabel.setPositionFromSize(0, 1, pos.x, pos.y);
  this.appendChild(this.comboValueLabel);

  if (this.mode != 'freePlay') {
    // time left label
    pos = this.comboValueLabel.getPosition();
    this.timeLeftLabel = this.createLabel(three7.i18n.t('game.timeLeft'));
    this.timeLeftLabel.setPositionFromSize(0, 2, pos.x, pos.y);
    this.appendChild(this.timeLeftLabel);

    // time left 
    this.timeLeft = three7.game.TIME_LIMIT[this.mode] * 1000;

    // time left value label
    pos = this.timeLeftLabel.getPosition();
    this.timeLeftValueLabel = this.createLabel(this.timeLeftToString());
    this.timeLeftValueLabel.setFontWeight('bold');
    this.timeLeftValueLabel.setPositionFromSize(0, 1, pos.x, pos.y);
    this.appendChild(this.timeLeftValueLabel);
  }
};

goog.inherits(three7.game.Scene, lime.Scene);

/**
 * Start game logic.
 */
three7.game.Scene.prototype.start = function() {
  var self = this;

  // stop everything first
  this.stop();

  // create game logic
  this.logic = new three7.game.Logic();

  // on block spawned
  goog.events.listen(this.logic, 'gameOver', function(event) {
    self.gameEnded('gameOver');
  });

  // on block spawned
  goog.events.listen(this.logic, 'blockSpawned', function(event) {
    var blockSprite = new three7.game.BlockSprite(event.block, self.isQuestionPiece);
    // link two-way link
    blockSprite.block._sprite = blockSprite;
    self.grid.appendChild(blockSprite);
    blockSprite.updatePosition();
  });

  // on block position changed
  goog.events.listen(this.logic, 'blockPositionChanged', function(event) {
    event.block._sprite.updatePosition();
  });

  // on blocks cleared
  goog.events.listen(this.logic, 'blocksCleared', function(event) {
    // create animation
    var blink = new lime.animation.Sequence(
      new lime.animation.FadeTo(0.25).setDuration(0.05),
      new lime.animation.FadeTo(1.0).setDuration(0.05),
      new lime.animation.FadeTo(0.25).setDuration(0.05),
      new lime.animation.FadeTo(1.0).setDuration(0.05),
      new lime.animation.FadeTo(0.25).setDuration(0.05),
      new lime.animation.FadeTo(1.0).setDuration(0.05),
      new lime.animation.FadeTo(0.25).setDuration(0.05),
      new lime.animation.FadeTo(1.0).setDuration(0.05),
      new lime.animation.FadeTo(0.25).setDuration(0.05),
      new lime.animation.FadeTo(1.0).setDuration(0.05),
      new lime.animation.FadeTo(0.25).setDuration(0.05),
      new lime.animation.FadeTo(1.0).setDuration(0.05),
      new lime.animation.FadeTo(0.0).setDuration(0.1));
    // add blocks to animation
    goog.array.forEach(event.blocks, function(block) {
      blink.addTarget(block._sprite);
    });
    // when animation ends, clean up blocks
    goog.events.listen(blink, lime.animation.Event.STOP, function() {
      event.onCleared();
      goog.array.forEach(event.blocks, function(block) {
        self.grid.removeChild(block._sprite);
      });
    });
    // create effect for blocks & chain number
    self.createEffect(event.blocks, event.chains);
    // fire animation
    blink.play();
  });

  // on next piece changed 
  goog.events.listen(this.logic, 'nextPieceGenerated', function(event) {
    self.setNextPiece(event.piece);
  });

  // on score changed 
  goog.events.listen(this.logic, 'scoreChanged', function(event) {
    self.character.targetScore = event.score;
    if (self.mode === 'netPlay') {
      three7.client.updateScore(event.score);
    }
    self.character.setHappy();
  });

  // on chains changed 
  goog.events.listen(this.logic, 'chainsChanged', function(event) {
    self.chains = event.chains;
    self.chainsValueLabel.setText(Math.floor(self.chains).toString());
  });

  // on combo changed 
  goog.events.listen(this.logic, 'comboChanged', function(event) {
    self.targetCombo = event.combo;
  });

  // first time?
  if (!this.hasOwnProperty('touchState')) {
    this.touchState = {
      canDrag : function(e) {
        // didn't drag much?
        if (Math.abs(this.position.x - e.position.x) < three7.game.MIN_DRAG_OFFSET) {
          return false;
        }
        if (this.mode === null) {
          lime.scheduleManager.unschedule(this.enterFallMode, this);
          this.initialColumn = self.logic.pieceColumn();
          this.initialColumnTarget = this.localToGridColumn(e.position);
          this.mode = 'drag';
        }
        return true;
      },
      enterFallMode : function() {
        this.mode = 'fall';
        self.logic.setPieceFallDown(true);
      },
      drag : function(position) {
        var column = (this.initialColumn === null) ? 0 : this.initialColumn;
        column += (this.localToGridColumn(position) - this.initialColumnTarget);
        self.logic.setPieceColumnTarget(column);
      },
      localToGridColumn : function(pos) {
        var column = self.localToNode(pos, self.grid).x;
        column = goog.math.clamp(column / three7.game.BLOCK_SIZE,
                                 0, three7.game.GRID_WIDTH - 1);
        return Math.floor(column);
      }
    };

    // listen for touch and mouse events
    goog.events.listen(this, ['mousedown', 'touchstart'], function(e) {
      if (this.paused) {
        return;
      }
      // copy event position and enable rotation
      this.touchState.position = e.position.clone();
      this.touchState.mode = null;

      // enter fall mode if rotation is not fired
      lime.scheduleManager.scheduleWithDelay(this.touchState.enterFallMode,
        this.touchState, three7.game.MIN_FALL_TAP_TIME, 1);

      e.swallow(['mousemove', 'touchmove'], function(e) {
        if ((this.touchState.mode !== 'fall') && (this.touchState.canDrag(e))) {
          this.touchState.drag(e.position);
        }
      });

      e.swallow(['mouseup', 'touchend', 'touchcancel'], function(e) {
        if (this.touchState.mode === null) {
          lime.scheduleManager.unschedule(this.touchState.enterFallMode, this.touchState);
          // rotate because it was a quick tap
          this.logic.setPieceRotateRight();
        }
        this.logic.setPieceColumnTarget(null);
        this.logic.setPieceFallDown(false);
      });
    });

    // listen for key down events
    goog.events.listen(this, goog.events.EventType.KEYDOWN, function(e) {
      var column, code = e.event.keyCode, codes = goog.events.KeyCodes;
      // left
      if (code === codes.LEFT) {
        column = this.logic.pieceColumn();
        if (column !== null) {
          this.logic.setPieceColumnTarget(column - 1);
        }
      }
      // right
      else if (code === codes.RIGHT) {
        column = this.logic.pieceColumn();
        if (column !== null) {
          this.logic.setPieceColumnTarget(column + 1);
        }
      }
      // down
      if (code === codes.DOWN) {
        this.logic.setPieceFallDown(true);
      }
      // rotate
      if ((code === codes.UP) || (code === codes.SPACE)) {
        this.logic.setPieceRotateRight();
      }
    }, false, this);

    // listen for key release events
    goog.events.listen(this, goog.events.EventType.KEYUP, function(e) {
      if (e.event.keyCode === goog.events.KeyCodes.DOWN) {
        this.logic.setPieceFallDown(false);
      }
    }, false, this);
  }

  this.character.start();
  if (this.character2) {
    this.character2.start();
  }
  lime.scheduleManager.schedule(this.updateStep, this);
};

/**
 * Stop game logic.
 */
three7.game.Scene.prototype.stop = function() {
  this.character.stop();
  if (this.character2) {
    this.character2.stop();
  }
  lime.scheduleManager.unschedule(this.updateStep, this);
};

/**
 * Create block grid.
 */
three7.game.Scene.prototype.createGrid = function() {
  this.grid = new lime.Sprite();
  this.grid.setAnchorPoint(0, 0);
  this.grid.setSize(three7.game.BLOCK_SIZE * three7.game.GRID_WIDTH, three7.game.BLOCK_SIZE * (three7.game.GRID_HEIGHT - 2));
  this.grid.setPositionFromSize(-0.5, -1.3, three7.WIDTH * 0.5, three7.HEIGHT);
  this.grid.setFill(0, 0, 0, 0.2);
  this.appendChild(this.grid);
};

/**
 * Create character.
 */
three7.game.Scene.prototype.createCharacter = function(number, data) {
  var faceHalfHeight, character;
  // face 
  character = new three7.game.Character(data);
  character.face.setScale(0.5, 0.5);
  character.eyes.setScale(0.5, 0.5);
  faceHalfHeight = character.face.getSize().height * 0.25;
  // nickname
  character.nickNameLabel = this.createLabel(character.data.nickName.slice(0, 7));
  if (number === 1) {
    character.nickNameLabel.setPositionFromSize(0, -1, 0, -faceHalfHeight);
  }
  else {
    character.nickNameLabel.setPositionFromSize(0, 1, 0, faceHalfHeight);
  }
  character.appendChild(character.nickNameLabel);
  // score
  character.scoreLabel = this.createLabel(three7.i18n.t('game.score'));
  if (number === 1) {
    character.scoreLabel.setPositionFromSize(0, 0.75, 0, faceHalfHeight);
  }
  else {
    character.scoreLabel.setPositionFromSize(0, -0.75, 0, -faceHalfHeight);
  }
  character.appendChild(character.scoreLabel);
  // score
  character.updateScore = function() {
    var score = Math.floor(character.score);
    score = goog.string.padNumber(score, three7.game.SCORE_MIN_DIGITS);
    character.scoreValueLabel.setText(score);
  };
  character.score = 0;
  character.targetScore = 0;
  character.scoreValueLabel = this.createLabel();
  character.updateScore();
  character.scoreValueLabel.setFontWeight('bold');
  if (number === 1) {
    character.scoreValueLabel.setPositionFromSize(0, 1.75, -5, faceHalfHeight);
  }
  else {
    character.scoreValueLabel.setPositionFromSize(0, -1.75, -5, -faceHalfHeight);
  }
  character.appendChild(character.scoreValueLabel);
  this.appendChild(character);
  return character;
};

/**
 * Create visual effect for when a block is cleared.
 */
three7.game.Scene.prototype.createEffect = function(blocks, chains) {
  var self = this, fill, effect, time, pos, has777 = false;

  pos = new goog.math.Coordinate(0, three7.HEIGHT);

  // calculate middle point for blocks being cleared
  goog.array.forEach(blocks, function(block) {
    var blockPos = block._sprite.getPosition();
    if (block.number === 7) {
      has777 = true;
    }
    pos.x += blockPos.x;
    if (pos.y > blockPos.y) {
      pos.y = blockPos.y;
    }
  });

  pos.x = (pos.x / blocks.length) + three7.game.BLOCK_SIZE / 2;
  pos.y -= three7.game.BLOCK_SIZE / 2;

  pos = this.grid.localToNode(pos, this);

  if (has777) {
    fill = '777';
    time = 1.5;
    if (this.mode === 'netPlay') {
      // inform server of our 777
      three7.client.sendQuestionPiece();
    }
  }
  else if (chains === 1) {
    fill = 'small';
    time = 0.7;
  }
  else if (chains == 2) {
    fill = 'combo';
    time = 1;
  }
  else if (chains >= 3) {
    fill = 'big';
    time = 1.5;
  }

  if (fill) {
    fill = 'effect_' + fill + '.png';
    effect = new lime.Sprite();
    effect.setPosition(pos.x, pos.y);
    effect.setOpacity(0.0);
    effect.setFill(three7.getAtlasFrame(fill));
    this.appendChild(effect);
    effect.appear(function() {
      effect.hide(function() {
        self.removeChild(effect);
      }, time);
    }, 0.2);
  }
};

/**
 * Set paused state.
 */
three7.game.Scene.prototype.setPaused = function(paused) {
  this.paused = paused;
  this.menuButton.setHidden(this.paused);
};

/**
 * Create layer with the next block.
 */
three7.game.Scene.prototype.createNextBlocksLayer = function(number, data) {
  var layer, pos;
  layer = new lime.Layer();
  pos = (this.grid.getPosition().x + this.grid.getSize().width + three7.WIDTH) / 2;
  layer.setPosition(pos, three7.HEIGHT * 0.2);
  layer.nextLabel = this.createLabel(three7.i18n.t('game.next'));
  layer.appendChild(layer.nextLabel);
  layer.nextPiece = null;
  this.appendChild(layer);
  return layer;
};

/**
 * Create layer with the next falling block.
 */
three7.game.Scene.prototype.setNextPiece = function(piece) {
  var layer = this.nextBlockLayer, center;
  if (this.mode === 'netPlay') {
    if (three7.client.questionPieces > 0) {
      --three7.client.questionPieces;
      this.isQuestionPiece = true;
    }
    else {
      this.isQuestionPiece = false;
    }
  }
  center = piece.realCenterPosition();
  // remove old piece
  if (layer.nextPiece) {
    layer.removeChild(layer.nextPiece);
  }
  layer.nextPiece = new lime.Layer();
  // create each block
  goog.array.forEach(piece.blocks, function(block) {
    var sprite, image;
    sprite = new lime.Sprite();
    if (this.isQuestionPiece) {
      image = 'q';
    }
    else {
      image = block.number.toString();
    }
    sprite.setFill(three7.getAtlasFrame(image + '.png'));
    sprite.setSize(three7.game.NEXT_BLOCK_SIZE, three7.game.NEXT_BLOCK_SIZE);
    sprite.setPosition(three7.game.NEXT_BLOCK_SIZE * (block.position.x - center.x),
      three7.game.NEXT_BLOCK_SIZE * (block.position.y - center.y + 2));
    layer.nextPiece.appendChild(sprite);
  }, this);
  layer.appendChild(layer.nextPiece);
};

/**
 * Create default label.
 */
three7.game.Scene.prototype.createLabel = function(text, x, y) {
  var label = new lime.Label(text).setFontFamily('Verdana');
  label.setFontColor('#000').setFontSize(20);
  label.setShadow('#fff', 2, 1, 2);
  if ((x) && (y)) {
    label.setPosition(x, y);
  }
  return label;
};

/**
 * Show initial message.
 */
three7.game.Scene.prototype.showMessage = function(title, message, button) {
  var self = this, messageDialog;

  this.setPaused(true);
  messageDialog = new three7.game.MessageDialog(title, message, button, function() {
    messageDialog.hide(function() {
      self.removeChild(messageDialog);
      self.setPaused(false);
      self.start();
    });
  });
  this.appendChild(messageDialog);
  messageDialog.appear();
};

/**
 * Game ended callback.
 */
three7.game.Scene.prototype.gameEnded = function(reason) {
  var self = this;

  // game is over
  this.gameOver = true;

  if (this.mode === 'netPlay') {
    three7.client.setPlayerResult({
      'state' : reason,
      'score' : this.character.targetScore,
      'timeLeft' : Math.ceil(this.timeLeft)
    });
    // inform server of our result
    three7.client.updateResult();

    if (this.gameOverWaitMenuDialog === null) {
      this.setPaused(true);
      // make sure pause menu is removed if it exists
      if (this.pauseMenuDialog) {
        this.removeChild(this.pauseMenuDialog);
        this.pauseMenuDialog = null;
      }
      // show game over dialog
      this.gameOverWaitMenuDialog = new three7.netplay.GameOverWaitMenuDialog(function() {
        self.stop();
      });
      this.appendChild(this.gameOverWaitMenuDialog);
      this.gameOverWaitMenuDialog.appear(function() {
        var enabled = true;
        // check if game is over
        self.gameOverWaitMenuDialog.checkMatchResult = function() {
          var result = three7.client.matchResult;
          // do we have a result?
          if ((enabled) && ((result !== null) || (!three7.client.isOpponentPresent))) {
            enabled = false;
            if (result === null) {
              result = 'win';
            }
            // hide and show game over dialog
            self.gameOverWaitMenuDialog.hide(function() {
              self.removeChild(self.gameOverWaitMenuDialog);
              self.gameOverWaitMenuDialog = null;
              self.showGameOver(result);
            });
          }
        };
      });
    }
  }
  else if (this.mode === 'storyPlay') {
    if (reason === 'timeUp') {
      if (this.character.targetScore <= this.character2.targetScore) {
        reason = 'lose';
      }
      else {
        reason = 'win';
      }
    }
    this.showGameOver(reason);
  }
  else {
    this.showGameOver(reason);
  }
};

/**
 * Show game over screen.
 */
three7.game.Scene.prototype.showGameOver = function(reason) {
  var self = this;
  if (this.gameOverMenuDialog === null) {
    this.setPaused(true);
    // make sure pause menu is removed if it exists
    if (this.pauseMenuDialog) {
      this.removeChild(this.pauseMenuDialog);
      this.pauseMenuDialog = null;
    }
    // show game over dialog
    this.gameOverMenuDialog = new three7.game.GameOverMenuDialog(reason, function(willQuit) {
      self.stop();
      if (willQuit) {
        return;
      }
      self.gameOverMenuDialog.hide(function() {
        // restart game
        self.removeChild(self.grid);
        self.createGrid();
        goog.events.removeAll(self.logic);
        self.start();
        // reset stats
        self.character.targetScore = 0;
        if (self.character2) {
          self.character2.targetScore = 0;
        }
        self.chains = 0;
        self.chainsValueLabel.setText(self.chains.toString());
        self.targetCombo = 0;
        if (self.mode != 'freePlay') {
          self.timeLeft = three7.game.TIME_LIMIT[self.mode] * 1000;
          self.timeLeftValueLabel.setText(self.timeLeftToString());
        }
        self.isQuestionPiece = false;
        self.setPaused(false);
        self.gameOver = false;
        self.removeChild(self.gameOverMenuDialog);
        self.gameOverMenuDialog = null;
      });
    }, this);
    this.appendChild(this.gameOverMenuDialog);
    this.gameOverMenuDialog.appear();
  }
};

/**
 * Convert time from seconds to a digital clock format like "01:32".
 */
three7.game.Scene.prototype.timeLeftToString = function() {
  var seconds, minutes;
  seconds = Math.ceil(this.timeLeft / 1000);
  minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  if (seconds < 10) {
    return minutes + ":0" + seconds;
  }
  return minutes + ":" + seconds;
};

/**
 * Animate value using linear interpolation.
 */
three7.game.Scene.prototype.animatedValue = function(from, to, deltaTime, update) {
  var newFrom, initialFrom;
  if (from != to) {
    initialFrom = Math.floor(from);
    // animation finished?
    if (goog.math.nearlyEquals(from, to, 0.1)) {
      newFrom = to;
    }
    else {
      newFrom = goog.math.lerp(from, to, deltaTime / 500);
      newFrom = goog.math.clamp(newFrom, from, to);
    }
    update(newFrom, (initialFrom != Math.floor(newFrom)));
  }
};

/**
 * Update character's max combo value.
 */
three7.game.Scene.prototype.updateMaxComboStep = function(deltaTime) {
  var self = this;
  // cache function
  if (typeof this._updateMaxComboStep === 'undefined') {
    this._updateMaxComboStep = function(newCombo, needsUpdate) {
      self.combo = newCombo;
      if (needsUpdate) {
        self.comboValueLabel.setText(Math.floor(self.combo).toString());
      }
    };
  }
  // animate combo label
  this.animatedValue(this.combo, this.targetCombo,
                     deltaTime, this._updateMaxComboStep);
};

/**
 * Update character's score.
 */
three7.game.Scene.prototype.updateScoreStep = function(character, deltaTime) {
  // cache function
  if (typeof character._updateScoreStep === 'undefined') {
    character._updateScoreStep = function(newScore, needsUpdate) {
      character.score = newScore;
      if (needsUpdate) {
        character.updateScore();
      }
    };
  }
  // animate score label
  this.animatedValue(character.score, character.targetScore,
                     deltaTime, character._updateScoreStep);
};

/**
 * Update time left.
 */
three7.game.Scene.prototype.updateTimeLeftStep = function(deltaTime) {
  var timeLeft = this.timeLeft - deltaTime, text;
  if (timeLeft <= 0) {
    this.timeLeft = 0;
    this.gameEnded('timeUp');
  }
  else {
    this.timeLeft = timeLeft;
  }
  text = this.timeLeftToString();
  // update time when it changes
  if (text != this.timeLeftValueLabel.getText()) {
    if (this.mode === 'storyPlay') {
      if (Math.random() <= three7.storyplay.RIVAL_SCORE_PROBABILITY) {
        // simulate rival play
        this.character2.targetScore +=
          Math.round(goog.math.uniformRandom(
                three7.storyplay.RIVAL_SCORE_MIN, three7.storyplay.RIVAL_SCORE_MAX));
        this.character2.setHappy();
      }
    }
    this.timeLeftValueLabel.setText(text);
  }
};

/**
 * Update game logic.
 */
three7.game.Scene.prototype.updateStep = function(deltaTime) {
  if ((!this.paused) || (this.mode === 'netPlay')) {
    if ((!this.gameOver) && (this.mode != 'freePlay')) {
      this.updateTimeLeftStep(deltaTime);
    }
    this.updateScoreStep(this.character, deltaTime);
    if (this.character2) {
      if (this.mode === 'netPlay') {
        if (this.character2.targetScore != three7.client.opponentScore) {
          this.character2.targetScore = three7.client.opponentScore;
          this.character2.setHappy();
        }
      }
      this.updateScoreStep(this.character2, deltaTime);
    }
    this.updateMaxComboStep(deltaTime);
    if (this.gameOver) {
      if ((this.gameOverWaitMenuDialog) && (this.gameOverWaitMenuDialog.checkMatchResult)) {
        this.gameOverWaitMenuDialog.checkMatchResult();
      }
    }
    else if ((this.mode === 'netPlay') && (!three7.client.isOpponentPresent)) { 
      this.gameEnded('gameOver');
    }
    else {
      this.logic.updateStep(deltaTime);
    }
  }
};
