function Minesweeper(canvas, width, height) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;

    this.setupGame();
	
}

/**
 * Initializes the grid for the width/height given and
 * sets up the game.
 */
Minesweeper.prototype.setupGame = function () {
    for (var x = 0; x < this.width; x++) {
        this.canvas.append("<tr>");
        for (var y = 0; y < this.height; y++) {
			const self = this;
			const cell = document.createElement('td');
			const cx = x;
			const cy = y;
			$(cell)
				.addClass("cell")
				.addClass("locked")
				.html("-")
				.click(function () {
					self.discoverCell(cell, cx, cy);
				});
			this.canvas.append(cell);
        }
        this.canvas.append("</tr>");
    }
	this.generateMines(10);
};

Minesweeper.prototype.generateMines = function(quantity) {
	this.mines = [];
	for (var i = 0; i < quantity; i++) {
		var n;
		do {
			n = parseInt(Math.random() * (this.width * this.height)) - 1;
		} while (this.mines[n]);
		this.mines[n] = true;
	}
}

Minesweeper.prototype.isMine = function (x, y) {
	return this.mines[x * this.width + y];
}


Minesweeper.prototype.forEachCellNearby = function (x, y, callback) {
	// x - 1
	var rx = x - 1;
	var ry;
	if (rx >= 0 || rx < this.width) {
		ry = y - 1;
		if (ry >= 0 || ry < this.height) {
			callback(rx, ry);
		}
		ry = y;
		if (ry >= 0 || ry < this.height) {
			callback(rx, ry);
		}
		ry = y + 1;
		if (ry >= 0 || ry < this.height) {
			callback(rx, ry);
		}
	}
	// x
	rx = x;
	if (rx >= 0 || rx < this.width) {
		ry = y - 1;
		if (ry >= 0 || ry < this.height) {
			callback(rx, ry);
		}
		ry = y + 1;
		if (ry >= 0 || ry < this.height) {
			callback(rx, ry);
		}
	}
	// x + 1
	rx = x + 1;
	if (rx >= 0 || rx < this.width) {
		ry = y - 1;
		if (ry >= 0 || ry < this.height) {
			callback(rx, ry);
		}
		ry = y;
		if (ry >= 0 || ry < this.height) {
			callback(rx, ry);
		}
		ry = y + 1;
		if (ry >= 0 || ry < this.height) {
			callback(rx, ry);
		}
	}
}

/**
 * Discovers the cell at the given coordinates. Usually called
 * when the player clicks.
 */
Minesweeper.prototype.discoverCell = function (cell, x, y) {
	const self = this;
	$(cell)
		.removeClass("locked");
	if (this.isMine(x, y)) {
		$(cell).addClass("mine");
	} else {
		$(cell).addClass("unlocked");
		// when a cell is discovered it may discover the nearest ones
		var n = 0;
		this.forEachCellNearby(x, y, function (rx, ry) {
			if (self.isMine(rx, ry)) {
				n++;
			}
		});
		$(cell).html(n);
	}
	
	console.log("clicked " + x + " " + y);
};
