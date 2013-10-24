
test:
	@node ./node_modules/.bin/mocha test/**/*.js --reporter spec --timeout 2000 --slow 1000

.PHONY: test