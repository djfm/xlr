var CustomScrollBar = (function() {

	var maxid = 0;

	return function(root, options) {
		var $root = $(root);
		var $handle = $root.find('div.handle');

		var id = 'custom-scroll-bar-' + maxid;
		maxid++;

		var direction = options.direction === 'horizontal' ? 'horizontal' : 'vertical';
		var maxValue;

		this.moveScroller = function(dpx) {
			var pct = null;

			if (direction === 'vertical') {
				var top = parseInt($handle.css('top'), 10);
				if (top + dpx < 0) {
					dpx = -top;
					pct = 0;
				} else if (top + dpx + $handle.height() >= $root.innerHeight()) {
					dpx = $root.innerHeight() - $handle.height() - top;
					pct = 1;
				}
				$handle.css('top', top + dpx);
					if (pct === null) {
						pct = top / ($root.innerHeight() - $handle.height());
					}
			} else {
				var left = parseInt($handle.css('left'), 10);
				if (left + dpx < 0) {
					dpx = -left;
					pct = 0;
				} else if (left + dpx + $handle.width() >= $root.innerWidth()) {
					dpx = $root.innerWidth() - $handle.width() - left;
					pct = 1;
				}
				$handle.css('left', left + dpx);
				if (pct === null) {
					pct = left / ($root.innerWidth() - $handle.width());
				}
			}

			if (this.onscroll) {
				this.onscroll(Math.floor(pct * maxValue));
			}
		};

		var dragging = false;
		$handle.on('mousedown', function(event) {
			event.preventDefault();

			if (dragging) {
				return;
			}

			dragging = true;
			$handle.addClass('dragged');

			function clearHandlers() {
				$(document).off('mouseup.' + id);
				$(document).off('mousemove.' + id);
			}

			if (event.button === 0) {
				var lastX = event.pageX;
				var lastY = event.pageY;

				$(document).on('mousemove.' + id, function(event) {
					event.preventDefault();

					var dx = event.pageX - lastX;
					var dy = event.pageY - lastY;
					lastX = event.pageX;
					lastY = event.pageY;

					this.moveScroller(direction === 'horizontal' ? dx : dy);
				}.bind(this));

				$(document).on('mouseup.' + id, function(event) {
					event.preventDefault();

					clearHandlers();
					dragging = false;
					$handle.removeClass('dragged');
				});
			}
		}.bind(this));

		this.adaptSize = function(scrollSize, maxv) {
			maxValue = maxv;
			var d = direction === 'horizontal' ? $root.innerWidth() : $root.innerHeight();
			var s = Math.max(25, Math.min(d / scrollSize * d, d));

			if (direction === 'horizontal') {
				$handle.width(s);
			} else {
				$handle.height(s);
			}
		};
	};
}());
