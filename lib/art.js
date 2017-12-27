var asciiArt = require('ascii-art')


function showArt(callback) {
	asciiArt.font("Heinrich", "Doom", function render(text) {
		if (typeof callback != 'function') {
			console.log(text)
		} else {
			callback(text)
		}
	})
}

module.exports = showArt