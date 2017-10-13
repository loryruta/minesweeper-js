function Minesweeper(canvas, width, height) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;

    this.buildGrid();
}

Minesweeper.prototype.buildGrid = function () {
    for (var x = 0; x < this.width; x++) {
        this.canvas.append("<tr>");
        for (var y = 0; y < this.height; y++) {
            this.canvas.append("<td id='x=" + x + ";y=" + y + "' class='cell locked' onclick='discoverCell(" + x + ", " + y + ")'></td>");
        }
        this.canvas.append("</tr>");
    }
};

Minesweeper.prototype.discoverCell = function (x, y) {
    var c = $('#x= ' + x + ';y=' + y);
    if (c) {
        c.removeClass("locked");
        c.addClass("unlocked");
    }
};
