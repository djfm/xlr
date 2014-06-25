var approxTextHeight = (function() {

	var div;

	var cache = {};

	return function(font, size, bold) {

		var key = font+':'+size+':'+(bold ? 'bold' : 'normal');

		if (!cache[key]) {

			if (!div) {
				div = document.createElement('div');
				div.style.position = 'absolute';
				div.style.top = '-1000px';
				div.style.left = '-1000px';
				document.body.appendChild(div);
			}

			div.style.fontFamily = font;
			div.style.fontWeight = bold ? 'bold' : 'normal';
			div.style.fontSize = size + 'pt';
			div.innerHTML = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZÉÀÛ';
			cache[key] = div.offsetHeight;
		}

		return cache[key];
	};
}());

var colNumToAlpha = function(col) {

	var baseDigits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var base = baseDigits.length;
	var alpha = '';
	var quotient = col - 1, remainder;

	if (quotient === 0) {
		return baseDigits[0];
	}

	while (quotient > 0) {
		remainder = quotient % base;
		alpha = baseDigits[remainder] + alpha;
		quotient = (quotient - remainder) / base;
	}

	return alpha;
};
