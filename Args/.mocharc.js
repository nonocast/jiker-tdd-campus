require('dotenv').config({ path: '.env.test' });

module.exports = {
	file: [
		'./test/ArgsTest.js',
	],
	recursive: false,
	watch: true
};