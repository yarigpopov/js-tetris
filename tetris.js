function Field(options) {
    this.width = options.w || 10;
    this.height = options.h || 15;
    this.cells = new Array(this.height);
    //initiolize cells
    for (var y = 0; y < this.height; y++) {
        this.cells[y] = new Array(this.width)
        for (var x = 0; x < this.width; x++) {
            this.cells[y][x] = 'O';
        }
    }
    this.turn = 0;
};

Field.prototype.draw = function() {
    var container = $('body');
    container.html('');
    for (var y = 0; y < this.height; y++) {
        container.append('<p>' + this.cells[y].join('|') + '<p>')

    }
};

Field.prototype.step = function() {
    this.turn++;
    console.log('Turn #', this.turn)
    if (!this.element || this.element == undefined) {
        this.element = new Element(this)
        this.draw();
    } else {
        if (this.element.move([0, 1])) {
            this.draw();
        }
    }
};

function Element(field) {
    function getShape(x, y) {
        // var possible = [[0,0],[1,3],[0,4],[-1,3]];
        // var shape = possible[Math.floor(Math.random()*possible.length)];
        return [
            [x, y],
            [x, y + 1],
            [x + 1, y],
            [x + 1, y + 1]
        ]; //always squere
    }

    this.field = field;
    this.x = Math.floor((this.field.width - 1) / 2);
    this.y = 0;
    this.cords = getShape(this.x, this.y);
    this.validateCords = function(cords) {
        var x = cords[0];
        var y = cords[1];
        var field = this.field;
        if (x < 0 || x >= field.width) {
            return false
        };
        if (y < 0 || y >= field.height) {
            return false
        };
        if (field.cells[y][x] !== 'O' || field.cells[y][x] !== '*') {
            return true
        };
    };
    this.cords.map(function(elm) {
        this.cells[elm[1]][elm[0]] = '*';
    }, this.field);
};

Element.prototype.turn = function() {};

Element.prototype.move = function(dir) {
    var that = this;
    var newCords = that.cords.map(function(value) {
        return [value[0] + dir[0], value[1] + dir[1]]
    });
    var moved = newCords.reduce(function(prev, curr) {
        return prev && that.validateCords(curr);
    }, true);

    if (moved) {
        that.cords.reduce(function(prev, curr) {
            that.field.cells[curr[1]][curr[0]] = 'O';
        }, 0);
        newCords.reduce(function(prev, curr) {
            that.field.cells[curr[1]][curr[0]] = '*';
        }, 0);
        that.cords = newCords;
        return true;
    } else {
        return false
    };
};

var tetris = new Field({
    "w": 10,
    "h": 15
});


tetris.draw();
setInterval(function() {
    tetris.step();
}, 1000);
