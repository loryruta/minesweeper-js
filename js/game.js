Game = function (width, height) {
    this.canvas = document.getElementById("minesweeper");

    this.width = width;
    this.height = height;
    this.size = width * height;
    this.border = "2";

    this.cellWidth = (1.0 / width) * (this.canvas.offsetWidth - (this.border * width * 2));
    this.cellHeight = (1.0 / height) * (this.canvas.offsetHeight - (this.border * height * 2));

    this.cells = [];
    this.mines = [];
    this.discovered = [];

    this.minesCount = 10;
    this.discoveredCount = 0;

    this.initGrid();
};


Game.prototype.initCell = function (cell, x, y) {
    const self = this;

    // By default, when initialized the cell is undiscovered.
    // The cell class is always present.
    cell.style.border.width = this.border + "px";
    cell.className = "cell undiscovered";
    cell.innerHTML = "&nbsp;";
    cell.style.fontSize = parseInt(this.cellHeight / 2) + "px";
    cell.onclick = function () {
        self.discover(cell, x, y);
    };
};


Game.prototype.initGrid = function () {
    this.grid = document.createElement("table");
    this.grid.className = "minesweeper-tab";
    for (var y = 0; y < this.height; y++) {
        var row = document.createElement("tr");
        for (var x = 0; x < this.width; x++) {
            const cell = document.createElement("td");
            this.initCell(cell, x, y);
            row.appendChild(cell);

            this.cells[y * this.width + x] = cell;
        }
        this.grid.appendChild(row);
    }
    this.canvas.appendChild(this.grid);
    this.generateMines();
};


Game.prototype.isCellInside = function (x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
};

Game.prototype.foreachCellAround = function (x, y, callback, corners) {
    for (var dx = -1; dx <= 1; dx++) {
        for (var dy = -1; dy <= 1; dy++) {
            if ((corners && (dx !== 0 || dy !== 0)) || (!corners && (dx === 0 || dy === 0))) {
                const rx = x + dx;
                const ry = y + dy;
                if (this.isCellInside(rx, ry)) {
                    callback(rx, ry);
                }
            }
        }
    }
};

Game.prototype.getCell = function (x, y) {
    return this.cells[y * this.width + x];
};


Game.prototype.isMine = function (x, y) {
    return this.mines.indexOf(y * this.width + x) >= 0;
};

Game.prototype.getAroundMinesCount = function (x, y) {
    const self = this;
    var n = 0;
    this.foreachCellAround(x, y, function (ax, ay) {
        if (self.isMine(ax, ay))
            n++;
    }, true);
    return n;
};

Game.prototype.generateMines = function () {
    this.mines = [];
    for (var i = 0; i < this.minesCount; i++) {
        var mi;
        do {
            mi = Math.floor(Math.random() * this.size);
        } while (this.isMine(mi));
        this.mines.push(mi);
    }
    console.log("Mines generated at: " + this.mines);
};


Game.prototype.isDiscovered = function (x, y) {
    return this.discovered[y * this.width + x];
};

Game.prototype.discover = function (cell, x, y) {
    if (this.isDiscovered(x, y))
        return;
    this.discovered[y * this.width + x] = true;
    this.discoveredCount++;
    if (this.isMine(x, y)) {
        for (var i = 0; i < this.minesCount; i++) {
            var mine = this.cells[this.mines[i]];
            mine.className = "cell mine";
            mine.innerHTML = "&nbsp;";
        }
        this.openGameOverMenu();
    } else {
        const self = this;
        cell.className = "cell normal-discovered";
        var cnt = this.getAroundMinesCount(x, y);
        if (cnt === 0) {
            this.foreachCellAround(x, y, function (relX, relY) {
                if (self.isDiscovered(x, y))
                    self.discover(self.getCell(relX, relY), relX, relY);
            }, true);
            cell.innerHTML = "&nbsp;";
        } else
            cell.innerHTML = cnt;
    }
};


Game.prototype.destroy = function () {
    this.cells = [];
    this.mines = [];
    this.discovered = [];
    this.canvas.removeChild(this.table);
};


Game.prototype.openGameOverMenu = function () {
    var menu = document.getElementById("game-over");
    menu.style.zIndex = "1";
    menu.style.animation = "fadein 2s 1";
};

Game.prototype.closeGameOverMenu = function () {
    var menu = document.getElementById("game-over");
    menu.style.zIndex = "-1";
    menu.style.animation = "";
};
