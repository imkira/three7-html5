goog.provide('three7.i18n.en');
goog.require('three7.i18n');

three7.i18n.en = {
  name : 'en',
  translations: {
    'mainMenu' : {
      'storyPlay' : 'Story',
      'freePlay' : 'Free Play',
      'netPlay' : 'Net Play'
    },
    'menuButton' : {
      'howToPlay' : '?',
      'game' : '●',
      'back' : '←'
    },
    story : {
      'you' : 'Michael',
      'rival' : 'Jackson',
      'fishSpotted' : 'Fish spottd!',
      'intro' : 'Jackson has teh fish. Beat teh crap out ov him within 3 minutez an u can has it!',
      'meow' : 'Meow!'
    },
    'game' : {
      'score' : 'SCORE',
      'next' : 'NEXT',
      'chains' : 'CHAINS',
      'timeLeft' : 'TIME LEFT',
      'combo' : 'COMBO',
      'menu' : {
        'title' : 'Menu',
        'resume' : 'Resume Game',
        'retry' : 'Try Again',
        'quit' : 'Quit Game',
        'backToTitle' : 'Back to Title',
        'gameOver' : 'Game Over',
        'timeUp' : 'Time Up',
        'win' : 'You Win',
        'lose' : 'You Lost',
        'draw' : 'Draw'
      }
    },
    'charSelect' : {
      'title' : 'Profile',
      'nickName' : 'Nick Name',
      'explanation' : 'Choose face, eyes and color',
      'play' : 'Play',
      'edit' : 'Edit',
      'face' : 'Face',
      'eyes' : 'Eyes',
      'colors' : 'Color'
    },
    'netPlay' : {
      'userCount' : 'Currently %d connected player(s).',
      'pleaseWait' : 'Please Wait',
      'waitingOpponent' : 'Waiting for Opponent...',
      'forceQuit' : 'Force Quit',
      'vs' : 'VS.',
      'opponentNickName' : '%s',
      'errors' : {
        'connectionFailed' : 'Error Connecting.',
        'invalidData' : 'Internal Server Error.',
        'alreadyInUse' : 'Nick name already in use!'
      }
    },
    'howToPlay' : {
      'three7' : 'Cat Fight 7',
      'rules' : 'Rules',
      'controls' : 'Controls',
      'falling_blocks_game' : 'A Falling-Blocks + Puzzle Game.',
      'blocks_1_to_7' : 'Blocks are numbered from 1 to 7.',
      'sum_7' : 'Horizontal or vertical sequences adding up to 7 disappear.',
      'clear_777' : 'To clear a block numbered 7, you need a sequence of 3 or more 7s.',
      'tap_to_rotate' : 'Tap to rotate.',
      'slide_left_right' : 'Slide to move the block horizontally.',
      'push_down_to_fall' : 'A long press makes the block fall.'
    }
  }
}; 

three7.i18n.registerLanguage(three7.i18n.en);
