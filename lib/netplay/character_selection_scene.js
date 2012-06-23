goog.provide('three7.netplay.CharacterSelectionScene');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.Label');
goog.require('lime.Layer');
goog.require('lime.RoundedRect');
goog.require('lime.transitions.SlideInUp');
goog.require('lime.transitions.SlideInDown');
goog.require('three7.storage');
goog.require('three7.i18n');
goog.require('three7.game.Character');
goog.require('three7.netplay.WaitingMatchScene');
goog.require('three7.controls.TextInput');
goog.require('three7.controls.Button');

/**
 * Class that implements Three7's character selection scene.
 */
three7.netplay.CharacterSelectionScene = function() {
  var self = this;

  goog.base(this);

  // title
  this.titleLabel = new lime.Label(three7.i18n.t('charSelect.title'));
  this.titleLabel.setFontColor('#000').setFontSize(40);
  this.titleLabel.setPositionFromScreen(0.5, 0.07);
  this.titleLabel.setShadow('#fff', 2, 1, 2);
  this.appendChild(this.titleLabel);

  // back button
  this.backButton = new three7.createContextualButton('back', function(e) {
    var scene;
    self.savePreferences();
    self.removeTextInput();
    self.character.stop();
    scene = new three7.MainMenuScene();
    three7.director.replaceScene(scene, lime.transitions.SlideInDown, 1);
  }, this);
  this.appendChild(this.backButton);

  // nick name
  this.nickNameLabel = new lime.Label(three7.i18n.t('charSelect.nickName'));
  this.nickNameLabel.setFontColor('#000').setFontSize(30);
  this.nickNameLabel.setPositionFromScreen(0.27, 0.21);
  this.nickNameLabel.setShadow('#fff', 2, 1, 2);
  this.appendChild(this.nickNameLabel);

  // create input text box
  this.inputBox = null;
  
  // create button for getting focus on input text box
  this.editButton = new three7.controls.Button(function(e) {
    if (self.inputBox) {
      self.inputBox.focus();
    }
  }, three7.i18n.t('charSelect.edit'), 0.79, 0.20, three7.WIDTH * 0.15);
  this.appendChild(this.editButton);

  // explanation
  this.explanationLabel = new lime.Label(three7.i18n.t('charSelect.explanation'));
  this.explanationLabel.setFontColor('#000').setFontSize(30);
  this.explanationLabel.setPositionFromScreen(0.5, 0.29);
  this.explanationLabel.setShadow('#fff', 2, 1, 2);
  this.appendChild(this.explanationLabel);

  // create part tabs
  this.partOrder = ['face', 'eyes', 'colors'];
  this.partColor = ['mike', 'yw', 'bk'];
  this.partTabs = this.createPartTabs();
  this.appendChild(this.partTabs);

  // create empty customized character
  this.character = new three7.game.Character();
  this.character.setPositionFromScreen(0.5, 0.73);
  this.appendChild(this.character);

  // play button
  this.playButton = new three7.controls.Button(function(e) {
    var scene;
    if (self.inputBox === null) {
      return;
    }
    self.character.data.nickName = self.inputBox.text();
    if (self.character.data.nickName.length === 0) {
      self.inputBox.focus();
    }
    else {
      self.savePreferences();
      self.removeTextInput();
      self.character.stop();
      scene = new three7.netplay.WaitingMatchScene(self.character.data);
      three7.director.replaceScene(scene, lime.transitions.SlideInUp, 1);
    }
  }, three7.i18n.t('charSelect.play'), 0.5, 0.9, three7.WIDTH * 0.35);
  this.appendChild(this.playButton);
};

goog.inherits(three7.netplay.CharacterSelectionScene, lime.Scene);

/**
 * Start scene
 */
three7.netplay.CharacterSelectionScene.prototype.start = function() {
  if (this.inputBox === null) {
    this.inputBox = new three7.controls.TextInput(this.character.data.nickName, three7.WIDTH * 0.44,
        three7.HEIGHT * 0.18, three7.WIDTH * 0.2, three7.HEIGHT * 0.04);
  }
};

/**
 * Create tabs for choosing avatar parts.
 */
three7.netplay.CharacterSelectionScene.prototype.createPartTabs = function() {
  var self = this, i, container, background, layers = [], createLayer,
      tabs = [], tabSelected = [], selectTab, selectedTab = null;

  // create parts layer
  createLayer = function(complete, partSelected) {
    var i, part, frame, layer = new lime.Layer();
    for (i = 1; i <= 3; ++i) {
      part = new lime.Sprite();
      frame = three7.getAtlasFrame(complete(i));
      part.setFill(frame);
      part.setPosition(-three7.WIDTH * 0.3 * (2 - i), 0);
      // create closure here
      (function(i) {
        goog.events.listen(part, ['mousedown', 'touchstart'], function(e) {
          if (!layer.getHidden()) {
            partSelected(i);
            self.character.invalidate();
          }
        });
      })(i);
      layer.appendChild(part);
    }
    return layer;
  };

  // behavior to run when a tab is selected
  selectTab = function(i) {
    return function(i) {
      if (selectedTab) {
        selectedTab.setOpacity(0.5);
        if (selectedTab.layer.getParent()) {
          selectedTab.layer.setHidden(true);
        }
      }
      selectedTab = tabs[i];
      if (!selectedTab.layer.getParent()) {
        container.appendChild(selectedTab.layer);
      }
      selectedTab.layer.setHidden(false);
      selectedTab.setOpacity(1.0);
    };
  };

  // create container
  container = new lime.Layer();
  container.setPositionFromScreen(0.5, 0.5);

  // create background
  background = new lime.Sprite().setFill('#ff6600').setOpacity(0.3);
  background.setSizeFromScreen(0.95, 0.22);
  container.appendChild(background);

  // faces layer
  layers[0] = createLayer(function(i) {
    return 'face_0' + i + '.png';
  }, function(i) {
    self.character.data.face = i;
  });

  // eyes layer
  layers[1] = createLayer(function(i) {
    return 'eyes_0' + i + '.png';
  }, function(i) {
    self.character.data.eyes = i;
  });

  // color layer
  layers[2] = createLayer(function(i) {
    return 'face_01_' + self.partColor[i-1] + '.png';
  }, function(i) {
    self.character.data.color = self.partColor[i-1];
  });

  // create tabs
  for (i = 0; i < 3; ++i) {
    tabSelected[i] = selectTab(i);
    tabs[i] = this.createTab(tabSelected[i], this.partOrder[i], i, background);
    tabs[i].layer = layers[i];
    container.appendChild(tabs[i]);
  }

  // select first tab
  tabSelected[0](0);

  return container;
};

/**
 * Create tab for choosing avatar parts.
 */
three7.netplay.CharacterSelectionScene.prototype.createTab = function(click, name, index, frame) {
  var pos = frame.getPosition(), size = frame.getSize(), width, height, tab;
  width = size.width / 3 - 2;
  height = 50;
  pos = frame.getPosition().clone();
  pos.x = (pos.x + size.width * index / 3 + (width - size.width) / 2) / three7.WIDTH;
  pos.y = (pos.y - (height + size.height) / 2) / three7.HEIGHT;
  tab = new three7.controls.Button(function(e) {
    click(index);
  }, three7.i18n.t('charSelect.' + name), pos.x, pos.y, width, height); 
  tab.setOpacity(0.5);
  return tab;
};

/**
 * Save preferences in the local storage
 */
three7.netplay.CharacterSelectionScene.prototype.savePreferences = function() {
  var nickName;
  if (this.inputBox) {
    nickName = this.inputBox.text();
    three7.storage.setValue('character.nickName', nickName);
  }

  three7.storage.setValue('character.color', this.character.data.color);
  three7.storage.setValue('character.face', this.character.data.face);
  three7.storage.setValue('character.eyes', this.character.data.eyes);
};

/**
 * Remove text input from scene.
 */
three7.netplay.CharacterSelectionScene.prototype.removeTextInput = function() {
  if (this.inputBox) {
    this.inputBox.dispose();
    this.inputBox = null;
  }
};
