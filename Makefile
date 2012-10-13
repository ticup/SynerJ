
install:
	npm install
	git submodule init
	git submodule update

test:
	./node_modules/.bin/mocha \
  	--reporter spec
		-c \
		test/api \
		test/integration

ci-test:
	/usr/local/bin/nodemon \
		./node_modules/.bin/mocha \
			--reporter spec \
			-c \
			test/api \
			
.PHONY: install
