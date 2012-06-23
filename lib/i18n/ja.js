goog.provide('three7.i18n.ja');
goog.require('three7.i18n');

three7.i18n.ja = {
  name : 'ja',
  translations: {
    'mainMenu' : {
      'storyPlay' : 'ストーリー',
      'freePlay' : '暇だにゃ♪',
      'netPlay' : 'ネット対戦'
    },
    'menuButton' : {
      'howToPlay' : '?',
      'game' : '●',
      'back' : '←'
    },
    story : {
      'you' : 'マイケル',
      'rival' : 'ジャクソン',
      'fishSpotted' : '魚発見！',
      'intro' : 'ジャクソンに魚を取られた！３分以内に、あいつを倒して奪い返すニャン！',
      'meow' : '(=ｘェｘ=)'
    },
    'game' : {
      'score' : 'SCORE',
      'next' : 'NEXT',
      'chains' : 'CHAINS',
      'timeLeft' : 'TIME LEFT',
      'combo' : 'COMBO',
      'menu' : {
        'title' : 'メニュー',
        'resume' : 'ゲームに戻る',
        'retry' : 'もう一度やる',
        'quit' : 'ゲームを終了',
        'backToTitle' : 'タイトルへ',
        'gameOver' : 'GAME OVER',
        'timeUp' : 'TIME UP',
        'win' : 'あなたの勝ち',
        'lose' : 'あなたの負け',
        'draw' : '引き分け'
      }
    },
    'charSelect' : {
      'title' : 'プロフ設定',
      'nickName' : 'ニックネーム',
      'explanation' : '顔・目・色を選んで遊びましょう♪',
      'play' : '遊ぶ',
      'edit' : '編集',
      'face' : '顔',
      'eyes' : '目',
      'colors' : '色'
    },
    'netPlay' : {
      'userCount' : '現在、%d人が遊んでいます。',
      'pleaseWait' : '少々お待ち下さい',
      'waitingOpponent' : '対戦相手待ちです...',
      'forceQuit' : '直ちに終了',
      'vs' : '対',
      'opponentNickName' : '%sさん',
      'errors' : {
        'connectionFailed' : '接続に失敗しました！',
        'invalidData' : 'サーバ内部エラー。',
        'alreadyInUse' : 'ニックネームは既に存在します！'
      }
    },
    'howToPlay' : {
      'three7' : 'Cat Fight 7',
      'rules' : 'ルール',
      'controls' : '操作',
      'falling_blocks_game' : '落ちもの計算ゲーム。',
      'blocks_1_to_7' : '１〜７のブロックがある。',
      'sum_7' : '縦横足して７になると消える。',
      'clear_777' : '７は３つ以上そろうと消える。',
      'tap_to_rotate' : 'タップで回転する。',
      'slide_left_right' : '左右スライドで左右に動く。',
      'push_down_to_fall' : '長押しで落ちる。'
    }
  }
}; 

three7.i18n.registerLanguage(three7.i18n.ja);
