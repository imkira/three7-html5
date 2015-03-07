.PHONY: all clean deps build

all: deps build

clean:
	rm -rf limejs
	rm -f public/three7.js
	rm -rf public/assets

deps: limejs limejs/closure limejs/box2d limejs/bin/external/compiler.jar limejs/bin/external/SoyToJsSrcCompiler.jar

build: deps
	cd lib && ../limejs/bin/lime.py gensoy assets/images.json
	cd lib && ../limejs/bin/lime.py update
	cd lib && ../limejs/bin/lime.py build three7 -o ../public/three7.js
	rm -rf public/assets
	mkdir -p public/assets
	cp lib/assets/images.png public/assets/

limejs:
	git clone https://github.com/digitalfruit/limejs.git
	cd limejs && git checkout a4605962148f79f4a42c527ee8163572b3e390fb

limejs/closure:
	cd limejs && git clone https://github.com/google/closure-library.git closure
	cd limejs/closure && git checkout 0aeddac0c51afd4cd7234a66af89a780fc0f2111

limejs/box2d:
	cd limejs && git clone http://github.com/thinkpixellab/pl.git box2d
	cd limejs/box2d && git checkout 9a4f7456bc2ae3178324970b4b6da2ca8dec64dc

limejs/bin/external/compiler.jar:
	mkdir -p limejs/bin/external
	cd limejs/bin/external && curl -L https://closure-compiler.googlecode.com/files/compiler-20120305.zip -o compiler.zip
	cd limejs/bin/external && unzip -x compiler.zip compiler.jar -d .

limejs/bin/external/SoyToJsSrcCompiler.jar:
	mkdir -p limejs/bin/external
	cd limejs/bin/external && curl -L https://closure-templates.googlecode.com/files/closure-templates-for-javascript-2011-22-12.zip -o soy.zip
	cd limejs/bin/external && unzip soy.zip SoyToJsSrcCompiler.jar -d .
