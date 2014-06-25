var BFGGrid = (function(){

	var later = (function() {
		var handles = {};
		return function(handle, timeout, fn) {
			if (handles.hasOwnProperty(handle)) {
				window.clearTimeout(handles[handle]);
			}
			handles[handle] = window.setTimeout(fn, timeout);
		};
	}());

	return function(root) {
		var $root = $(root);
		var width = $root.width();
		var height = $root.height();
		var frozenWidth = 0;
		var frozenHeight = 0;

		var canvas;
		var ctx;

		var colWidth = 70, rowHeight = 25;
		var rowCount = 1000000, colCount = 256;
		var frozenRows = 2, frozenCols = 3;
		var hscroll = 0, vscroll = 0;
		var paneSeparatorSize = 4;

		var hscrollbar, vscrollbar;

		var adaptSize = function() {
			var hasCanvasAlready = !!canvas;
			if (!hasCanvasAlready) {
				canvas = document.createElement('canvas');
				ctx = canvas.getContext('2d');
			}
			var $holder = $(root).find('.canvas-holder');
			canvas.width = width = $holder.width();
			canvas.height = height = $holder.height();
			if (!hasCanvasAlready) {
				$holder.append(canvas);
			}

			hscrollbar.adaptSize(getTotalWidth(), colCount - frozenCols - 1);
			vscrollbar.adaptSize(getTotalHeight(), rowCount - frozenRows - 1);
		};

		var getTotalHeight = function() {
			return rowCount * rowHeight;
		};

		var getTotalWidth = function() {
			return colCount * colWidth;
		};

		var getColsWidth = function(startCol, endCol) {
			return (endCol - startCol + 1) * colWidth;
		};

		var getRowsHeight = function(startRow, endRow) {
			return (endRow - startRow + 1) * rowHeight;
		};

		var getRowHeight = function(rowNum) {
			return rowHeight;
		};

		var getColWidth = function(colnum) {
			return colWidth;
		};

		var drawCell = function(row, col, x, y, w, h) {
			var txt, s;

			if (row === 0 && col === 0) {
				ctx.fillStyle = '#aaa';
				ctx.fillRect(x, y, w, h);
			} else if (row === 0 && col > 0) {
				ctx.fillStyle = '#eee';
				ctx.fillRect(x, y, w, h);
				ctx.fillStyle = '#000';
				ctx.font = "15px arial";
				txt = colNumToAlpha(col);
				s = ctx.measureText(txt);
				ctx.fillText(txt, x + (w - s.width) / 2, y + (h - 15 / 2));

				ctx.beginPath();
				ctx.moveTo(x + w, y);
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#aaa';
				ctx.lineTo(x + w, y + h);
				ctx.stroke();
			} else if (row > 0 && col === 0) {
				ctx.fillStyle = '#eee';
				ctx.fillRect(x, y, w, h);
				ctx.fillStyle = '#000';
				ctx.font = "15px arial";
				txt = row;
				ctx.fillText(txt, x + 10 / 2, y + 18);

				ctx.beginPath();
				ctx.moveTo(x, y + h);
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#ccc';
				ctx.lineTo(x + w, y + h);
				ctx.stroke();
			}
		};

		var drawGrid = function(topRow, leftCol, bottomRow, rightCol, xTop, yTop, drawRowHandles, drawColHandles) {
			var x = xTop, y = yTop;
			var w = 0, h = 0;
			var row = topRow, col = leftCol;

			var maxW = drawRowHandles ? colWidth : 0, maxCol = leftCol;
			while (maxW < width && ((rightCol > 0 && maxCol <= rightCol) || rightCol === 0) && maxCol <= colCount) {
				maxW += getColWidth(maxCol);
				maxCol += 1;
			}

			var isColHandles = drawColHandles;
			while (h < height && ((bottomRow > 0 && row <= bottomRow) || bottomRow === 0) && row <= rowCount) {
				h += isColHandles ? rowHeight : getRowHeight(row);
				y = yTop + h;

				ctx.lineWidth = 1;
				ctx.strokeStyle = "#ccc";
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(x + maxW, y);
				ctx.stroke();

				if (!isColHandles) {
					row += 1;
				} else {
					isColHandles = false;
				}
			}

			var isRowHandles = drawRowHandles;
			while (w < width && ((rightCol > 0 && col <= rightCol) || rightCol === 0) && col <= colCount) {
				var cw = isRowHandles ? colWidth : getColWidth(leftCol);
				w += cw;
				x = xTop + w;

				ctx.lineWidth = 1;
				ctx.strokeStyle = "#ccc";
				ctx.beginPath();
				ctx.moveTo(x, yTop);
				ctx.lineTo(x, yTop + h);
				ctx.stroke();

				isColHandles = drawColHandles;
				h = 0;
				row = topRow;
				while (h < height && ((bottomRow > 0 && row <= bottomRow) || bottomRow === 0) && row <= rowCount) {
					var ch = isColHandles ? rowHeight : getRowHeight(row);
					h += ch;
					y = yTop + h;

					drawCell(isColHandles ? 0 : row, isRowHandles ? 0 : col, x - cw, y - ch, cw, ch);

					if (!isColHandles) {
						row += 1;
					} else {
						isColHandles = false;
					}
				}

				if (!isRowHandles) {
					col += 1;
				} else {
					isRowHandles = false;
				}
			}

			return [w, h];
		};

		var drawVerticalPaneSeparator = function(x) {
			ctx.lineWidth = paneSeparatorSize;
			ctx.strokeStyle = "#999";
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
		};

		var drawHorizontalPaneSeparator = function(y) {
			ctx.lineWidth = paneSeparatorSize;
			ctx.strokeStyle = "#999";
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		};

		var draw = function() {
			adaptSize();
			var wh;
			if (frozenRows === 0 && frozenCols === 0) {
				// One Part
				drawGrid(1 + vscroll, 1 + hscroll, 0, 0, 0, 0, true, true);
			} else if (frozenRows > 0 && frozenCols === 0) {
				// Top Part
				wh = drawGrid(1, 1 + hscroll, frozenRows, 0, 0, 0, true, true);
				// Bottom Part
				drawGrid(frozenRows + vscroll + 1, 1 + hscroll, 0, 0, 0, wh[1] + paneSeparatorSize, true, false);
			} else if (frozenRows === 0 && frozenCols > 0) {
				// Left Part
				wh = drawGrid(1 + vscroll, 1, 0, frozenCols, 0, 0, true, true);
				// Right Part
				drawGrid(1 + vscroll, frozenCols + hscroll + 1, 0, 0, wh[0] + paneSeparatorSize, 0, false, true);
			} else if (frozenRows > 0 && frozenCols > 0) {
				// Top Left Corner
				wh = drawGrid(1, 1, frozenRows, frozenCols, 0, 0, true, true);
				// Top Right Corner
				drawGrid(1, frozenCols + hscroll + 1, frozenRows, 0, wh[0] + paneSeparatorSize, 0, false, true);
				// Bottom Left Corner
				drawGrid(frozenRows + vscroll + 1, 1, 0, frozenCols, 0, wh[1] + paneSeparatorSize, true, false);
				// Bottom Right Corner
				drawGrid(frozenRows + vscroll + 1, frozenCols + hscroll + 1, 0, 0, wh[0] + paneSeparatorSize, wh[1] + paneSeparatorSize, false, false);
			}

			if (frozenCols > 0) {
				drawVerticalPaneSeparator(wh[0]);
				frozenWidth = wh[0];
			} else {
				frozenWidth = 0;
			}

			if (frozenRows > 0) {
				drawHorizontalPaneSeparator(wh[1]);
				frozenHeight = wh[1];
			} else {
				frozenHeight = 0;
			}
		};

		this.draw = function() {
			later('draw', 1000/60, draw);
		};

		var init = function() {
			$.get('/templates/bfg-grid.html', function(resp) {
				root.innerHTML = resp;
				hscrollbar = new CustomScrollBar($root.find('div.hscroll').get(0), {direction: 'horizontal'});
				vscrollbar = new CustomScrollBar($root.find('div.vscroll').get(0), {direction: 'vertical'});

				hscrollbar.onscroll = function(v) {
					hscroll = v;
					this.draw();
				}.bind(this);

				vscrollbar.onscroll = function(v) {
					vscroll = v;
					this.draw();
				}.bind(this);

				this.draw();
				$(window).resize(this.draw.bind(this));
			}.bind(this));
		};

		init.call(this);

	};
}());

BFGGrid.init = function() {
	$('div.bfg-grid').each(function(i, root){
		new BFGGrid(root);
	});
};

$(window).load(function() {
	BFGGrid.init();
});
