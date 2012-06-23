goog.provide('three7.MainMenu');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.transitions.Dissolve');
goog.require('lime.transitions.SlideInUp');
goog.require('lime.transitions.SlideInDown');
goog.require('goog.events');
goog.require('three7.i18n');
goog.require('lime.ASSETS.images.json');
goog.require('three7.controls.Button');
goog.require('three7.game.Scene');
goog.require('three7.game.HowToPlayScene');
goog.require('three7.storyplay.StoryScene');
goog.require('three7.netplay.CharacterSelectionScene');

/**
 * Class that implements main title scene
 */
three7.MainMenuScene = function() {
  goog.base(this);

  // game title
  this.title = new lime.Sprite();
  this.title.setPosition(three7.WIDTH / 2, three7.HEIGHT * 0.35);
  this.title.setFill(three7.getAtlasFrame('logo.png'));
  this.appendChild(this.title);

  // "Story Play" button
  this.storyPlayButton = this.createButton('storyPlay', function() {
    var transition, scene;
    // create story scene
    scene = new three7.storyplay.StoryScene(1, function() {
      var transition, scene, playerData, opponentData;
      playerData = {
        nickName : three7.i18n.t('story.you'),
          color : 'mike',
          face : 1,
          eyes : 2
      };
      opponentData = {
        nickName : three7.i18n.t('story.rival'),
          color : 'bk',
          face : 2,
          eyes : 1
      };
      scene = new three7.game.Scene('storyPlay', playerData, opponentData);
      transition = three7.director.replaceScene(scene, lime.transitions.SlideInDown, 1);
      goog.events.listen(transition, 'end', function() {
        var title, message, button;
        // when story telling ends, play game
        title = three7.i18n.t('story.fishSpotted');
        message = three7.i18n.t('story.intro');
        button = three7.i18n.t('story.meow');
        scene.showMessage(title, message, button);
      });
    });
    // show story scene before main game
    transition = three7.director.replaceScene(scene, lime.transitions.Dissolve, 1);
    goog.events.listen(transition, 'end', function() {
      scene.start();
    });
  }, 0.28, 0.7);

  // "Free Play" button
  this.storyPlayButton = this.createButton('freePlay', function() {
    var transition, scene = new three7.game.Scene('freePlay');
    transition = three7.director.replaceScene(scene, lime.transitions.SlideInUp, 1);
    goog.events.listen(transition, 'end', function() {
      scene.start();
    });
  }, 0.72, 0.7);

  // "Multi Play" button
  this.storyPlayButton = this.createButton('netPlay', function() {
    var transition, scene = new three7.netplay.CharacterSelectionScene();
    transition = three7.director.replaceScene(scene, lime.transitions.SlideInUp, 1);
    goog.events.listen(transition, 'end', function() {
      scene.start();
    });
  }, 0.5, 0.88);

  // "Help" button
  this.howToPlayButton = three7.createContextualButton('howToPlay', function() {
    var scene = new three7.game.HowToPlayScene(function() {
      scene = new three7.MainMenuScene();
      three7.director.replaceScene(scene, lime.transitions.Dissolve, 0.5);
    });
    three7.director.replaceScene(scene, lime.transitions.Dissolve, 0.5);
  }, this);
  this.appendChild(this.howToPlayButton);

  // log out if we get to the main screen and are still logged in
  three7.client.logOut();
};

goog.inherits(three7.MainMenuScene, lime.Scene);

/**
 * Create main button menu
 */
three7.MainMenuScene.prototype.createButton = function(key, click, x, y) {
  var button = new three7.controls.Button(click,
      three7.i18n.t('mainMenu.' + key), x, y, three7.WIDTH * 0.35);
  this.appendChild(button);
  return button;
};
