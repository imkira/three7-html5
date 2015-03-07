# three7-html5

This is an HTML5/Canvas falling-blocks game inspired by a similar game featured
in Yu-Yu Hakusho Japanese animation.

The game is similar to tetris, but the biggest difference relies on how blocks
are cleared. In order to clear a block, you have to place it adjacent to two
other blocks (vertically, horizontally, or both) and the sum of those three
blocks must be exactly 7 or, alternatively, the three blocks must be exactly 7,
7, 7. This can be cyclic and include chains.

I made it in a couple of days using limejs now nowjs during March of 2012, but
I decided to publish the code because I enjoyed the game a lot.

Please note that for compatibility reasons, I am forcing old versions of
dependencies and npm packages.

# Demo

[Online Demo](http://imkira.github.io/three7-html5).

Please note that because it is hosted as a static page on github, it is not
possible to play in multiplayer mode.

## Dependencies

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
