# three7-html5

This is an HTML5/Canvas falling-blocks game inspired by a similar game featured
in Yu-Yu Hakusho Japanese animation.

![Screencast](https://raw.githubusercontent.com/imkira/three7-html5/gh-pages/assets/screencast.gif)

This game may resemble tetris, but the biggest difference relies on how blocks
are cleared. All pieces have exactly 3 blocks. Each block has a value that goes
from 1 to 7. If a block falls with a value that when added to the values of
either horizontal or vertical sequence of blocks equals 7, then the falling
block and that sequence of blocks will disappear. Any blocks above those blocks
will fall and combos may be triggered. A block of 7 does not clear by itself,
since there must 2 or more blocks involved in the sum.

There is just an exception to this rule, which is the group of three 7 blocks
(hence the name of the game). If you manage to make a group of 7, 7, 7 (either
vertically or horizontally), you will also be able to clear those.

I made this game in a couple of days using limejs now nowjs during March of
2012, but I decided to publish the code because I enjoyed the game concept a
lot.

# Demo

[Online Demo](http://imkira.github.io/three7-html5).

Please note that because it is hosted as a static page on github, it is not
possible to play in multiplayer mode.

## Dependencies

Please note that for compatibility reasons, I am forcing old versions of
dependencies and npm packages.

- You need python and java to build the app with limejs
- You need an old version of node (v0.8.28 works) to run the server.

I recommend using [nvm](https://github.com/creationix/nvm) for installing
custom node versions.

## Installation

```shell
npm install
make deps
```

## Building

```shell
make build
```

## Running

```shell
node server.js
```

Open your browser at [http://127.0.0.1:8080](http://127.0.0.1:8080) to play the
game.
