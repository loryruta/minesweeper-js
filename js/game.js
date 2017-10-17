function Minesweeper(canvas, width, height, cellSpacing) {
    this.canvas = canvas;
    this.canvas.oncontextmenu = function () {
        return false;
    };

    this.width = width;
    this.height = height;
    this.size = width * height;

    this.minesCount = 10; // number of mines in the map
    this.discoveredCount = 0; // number of cells discovered

    this.cellSpacing = cellSpacing;
    this.cellWidth = ((1. / width) * (canvas.offsetWidth - cellSpacing * width * 2));
    this.cellHeight = ((1. / height) * (canvas.offsetHeight - cellSpacing * height * 2));

    this.setupGame();
}

Minesweeper.prototype.initCell = function (cell, x, y) {
    const self = this;

    cell.style.width = this.cellWidth + "px";
    cell.style.height = this.cellHeight + "px";

    cell.style.position = "absolute";

    // gets real coordinates considering the cell spacing
    var rx = (x * this.cellWidth ) + ((x * 2 + 1) * this.cellSpacing);
    var ry = (y * this.cellHeight) + ((y * 2 + 1) * this.cellSpacing);
    cell.style.transform = "translate(" + rx + "px, " + ry + "px)";

    cell.style.fontSize = this.cellHeight + "px";
    cell.style.lineHeight = this.cellHeight + "px";

    cell.style.border.width = this.cellSpacing + "px";

    cell.className = "cell undiscovered";

    cell.onclick = function () {
        self.discover(cell, x, y);
    };
    cell.onmousedown = function (e) {
        if (e.which === 3) {
            self.nextStatus(x, y);
        }
    };
};

Minesweeper.prototype.setupGame = function () {
    this.cells = [];
    this.discovered = [];
    this.status = [];

    for (var y = 0; y < this.height; y++) {
        var tabRow = document.createElement('div');
        tabRow.className += " grid-row";
        for (var x = 0; x < this.width; x++) {
            const cell = document.createElement('div');
            const i = y * this.width + x;

            this.initCell(cell, x, y);
            tabRow.appendChild(cell);

            this.cells[i] = cell;
            this.discovered[i] = false;
            this.status[i] = 0;
        }
        this.canvas.appendChild(tabRow);
    }
    this.generateMines(this.minesCount);
};


Minesweeper.prototype.isIn = function (x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
};


Minesweeper.prototype.generateMines = function (quantity) {
    this.mines = [];
    for (var i = 0; i < quantity; i++) {
        var n;
        do {
            n = Math.floor(Math.random() * (this.width * this.height));
        } while (this.mines.indexOf(n) >= 0);
        this.mines.push(n);
    }
};

Minesweeper.prototype.isMine = function (x, y) {
    return this.mines.indexOf(y * this.width + x) >= 0;
};


Minesweeper.prototype.getCell = function (x, y) {
    return this.isIn(x, y) ? this.cells[y * this.width + x] : null;
};


Minesweeper.prototype.foreachCellAround = function (x, y, callback, corners) {
    for (var dx = -1; dx <= 1; dx++) {
        for (var dy = -1; dy <= 1; dy++) {
            if ((corners && (dx !== 0 || dy !== 0)) || (!corners && (dx === 0 || dy === 0))) {
                const rx = x + dx;
                const ry = y + dy;
                if (this.isIn(rx, ry)) {
                    callback(rx, ry);
                }
            }
        }
    }
};

Minesweeper.prototype.getAroundMinesCount = function (x, y) {
    const self = this;
    var n = 0;
    this.foreachCellAround(x, y, function (ax, ay) {
        if (self.isMine(ax, ay))
            n++;
    }, true);
    return n;
};


Minesweeper.prototype.lockGame = function () {
    this.canvas.style.cursor = "default";
};


Minesweeper.prototype.isDiscovered = function (x, y) {
    return this.discovered[y * this.width + x];
};

Minesweeper.prototype.discover = function (cell, x, y) {
    if (this.isDiscovered(x, y)) return;

    this.discovered[y * this.width + x] = true;
    this.discoveredCount++;

    cell.classList.remove("undiscovered");

    // --- if a mine is discovered
    if (this.isMine(x, y)) {
        // discovers all the mines
        for (var j in this.mines) {
            const m = this.mines[j];
            const c = this.cells[m];
            c.className = "cell mine";
            c.innerHTML = "";
        }
        // locks the game
        this.lockGame();
    }
    // --- else if a normal cell is discovered
    else {
        cell.className = "cell normal-discovered";
        if (this.discoveredCount === (this.size - this.minesCount)) {
            alert("You won!");
            return;
        }
        const self = this;
        var v = this.getAroundMinesCount(x, y);
        if (v === 0) {
            this.foreachCellAround(x, y, function (ax, ay) {
                if (self.isDiscovered(x, y))
                    self.discover(self.getCell(ax, ay), ax, ay);
            }, false);
        } else
            cell.innerHTML = v;
    }
};


const NONE = 0;
const ALERT = 1;
const DOUBT = 2;

Minesweeper.prototype.getStatus = function (x, y) {
    return this.status[y * this.width + x];
};

Minesweeper.prototype.nextStatus = function (x, y) {
    var i = y * this.width + x;
    if (this.discovered[i]) return;
    if (++this.status[i] > 2) this.status[i] = 0;
    var s = this.status[i];
    switch (s) {
        case NONE:
            this.cells[i].innerHTML = "";
            break;
        case ALERT:
            this.cells[i].innerHTML = "!";
            break;
        case DOUBT:
            this.cells[i].innerHTML = "?";
            break;
        default:
            this.cells[i].innerHTML = "S";
            break;
    }
};