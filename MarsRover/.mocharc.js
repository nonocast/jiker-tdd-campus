require('dotenv').config({ path: '.env.test' });

module.exports = {
	file: [
		'./test/MarsRoverTest.js',
	],
	recursive: false,
	watch: false
};