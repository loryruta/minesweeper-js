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
    this.status = [];
    this.discovered = [];

    this.minesCount = 20;

    this.discoveredCount = 0;
    this.discoveredCountToWin = this.size - this.minesCount;

    this.initGrid();

    this.supposedMinesCount = 0;
    this.updateSupposedMinesDisplay();

    this.timer = 0;
    this.updateTimerDisplay();
    this.startTimer();
};


Game.prototype.get1dIndex = function (x, y) {
    return this.width * y + x;
};


Game.prototype.initCell = function (cell, x, y) {
    const self = this;

    // By default, when initialized the cell is undiscovered.
    // The cell class is always present.
    cell.style.border.width = this.border + "px";
    cell.className = "cell undiscovered idle";
    cell.innerHTML = "&nbsp;";
    cell.style.fontSize = parseInt(this.cellHeight / 2) + "px";
    cell.onclick = function () {
        self.discover(cell, x, y);
    };
    cell.oncontextmenu = function () {
        self.nextStatus(cell, x, y);
        return false;
    }
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

            var i = this.get1dIndex(x, y);
            this.cells[i] = cell;
            this.status[i] = 0;
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
        } while (this.mines.indexOf(mi) >= 0);
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
        displayGameMessage(document.getElementById("game-over"));
    } else {
        const self = this;
        cell.className = "cell normal-discovered";
        var cnt = this.getAroundMinesCount(x, y);
        if (cnt === 0) {
            this.foreachCellAround(x, y, function (relX, relY) {
                if (!self.isDiscovered(relX, relY) && self.getStatus(relX, relY) === 0)
                    self.discover(self.getCell(relX, relY), relX, relY);
            }, true);
            cell.innerHTML = "&nbsp;";
        } else
            cell.innerHTML = cnt;
        this.checkWin();
    }
};

Game.prototype.checkWin = function () {
    // TODO RECURSIVE CALLS TOO MANY TIMES THIS FUNC
    if (this.discoveredCount === this.discoveredCountToWin) {
        displayGameMessage(document.getElementById("game-win"));
    }
};


Game.prototype.startTimer = function () {
    const self = this;
    this.timerObj = window.setInterval(function () {
        self.timer++;
        self.updateTimerDisplay();
    }, 1000);
};

Game.prototype.updateTimerDisplay = function () {
    var date = new Date(null);
    date.setSeconds(this.timer);
    document.getElementById("timer").innerHTML = date.toISOString().substr(14, 5)
};

Game.prototype.updateSupposedMinesDisplay = function () {
    document.getElementById("supposed_mines").innerHTML = (this.minesCount - this.supposedMinesCount).toString();
};


const Status = {
    IDLE: 0,
    WARNING: 1,
    UNKNOWN: 2
};

Game.prototype.getStatus = function (x, y) {
    return this.status[this.get1dIndex(x, y)];
};

Game.prototype.nextStatus = function (cell, x, y) {
    if (this.isDiscovered(x, y))
        return;
    var i = this.get1dIndex(x, y);
    if (++this.status[i] > Status.UNKNOWN) {
        this.status[i] = Status.IDLE;
    }
    switch (this.status[i]) {
        case Status.IDLE:
            cell.className = "cell undiscovered idle";
            cell.innerHTML = "&nbsp;";
            // here is not needed, already done in unknown status
            // this.supposedMinesCount--;
            break;
        case Status.WARNING:
            cell.className = "cell undiscovered warning";
            cell.innerHTML = "!";
            // increments number of supposed mines
            this.supposedMinesCount++;
            this.updateSupposedMinesDisplay();
            break;
        case Status.UNKNOWN:
            cell.className = "cell undiscovered unknown";
            cell.innerHTML = "?";
            // decrements number of supposed mines
            this.supposedMinesCount--;
            this.updateSupposedMinesDisplay();
            break;
    }
};


Game.prototype.destroy = function () {
    this.cells = [];
    this.mines = [];
    this.discovered = [];
    this.canvas.removeChild(this.table);
};


/**
 * Displays the given game-message element.
 */
displayGameMessage = function (msgElement) {
    msgElement.style.zIndex = "2";
    msgElement.style.animation = "fadein 2s 1";
	clearInterval(this.timerObj);
};

/**
 * Close the given game-message element.
 */
hideGameMessage = function (msgElement) {
    msgElement.style.zIndex = "-1";
    msgElement.style.animation = "";
};


displayNewGameMessage = function () {
  displayGameMessage(document.getElementById("new-game"));
   // TODO find better way to disable new-game btn
  document.getElementById("new-game-button").style.pointerEvents = "none";
}
