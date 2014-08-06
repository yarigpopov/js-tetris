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
    this.cords.map(function(elm) {
        this.cells[elm[1]][elm[0]] = '*';
    }, this.field);
};

Element.prototype.turn = function() {};

Element.prototype.validateHozMove = function(X) {
    function result() {
        return {
            "moveX": arguments[0],
            "newCords": arguments[1]
            // "comment": arguments[2]
        }
    };

    var canMoveX = true;
    var newCords = this.cords.map(function(value) {
        var newPoint = [value[0] + X, value[1]];
        var field = this.field;
        if (newPoint[0] < 0 || newPoint[0] >= field.width) {
            canMoveX = false
        } else {
            var pnt = this.field.cells[newPoint[1]][newPoint[0]];
            if (!(pnt == 'O' || pnt == '*')) {
                canMoveX = false
            }
        };
        return newPoint;
    }, this);
    return result(canMove, newCords);
};

Element.prototype.validateVertMove = function(Y) {
    function result() {
        return {
            "moveY": arguments[0],
            "newCords": arguments[1],
            "hitGround": arguments[2]
        }
    };

    var canMoveY = true;
    var hitGround = false;
    var newCords = this.cords.map(function(value) {
        var newPoint = [value[0], value[1] + Y];
        var field = this.field;
        if (newPoint[1] < 0) {
            canMoveY = false
        } else if (newPoint[1] >= field.height) {
            canMoveY = false;
            hitGround = true;
        } else {
            var pnt = this.field.cells[newPoint[1]][newPoint[0]];
            if (!(pnt == 'O' || pnt == '*')) {
                canMoveY = false
                hitGround = true;
            }
        }
        return newPoint;
    }, this);
    return result(canMoveY, newCords, hitGround);
};


Element.prototype.move = function(dir) {
    function applyMove(newCords) {
    	console.log('Applying move to',newCords);
        that.cords.reduce(function(prev, curr) {
            that.field.cells[curr[1]][curr[0]] = 'O';
        }, 0);
        newCords.reduce(function(prev, curr) {
            that.field.cells[curr[1]][curr[0]] = '*';
        }, 0);
        that.cords = newCords;
    };

    function performHit() {
    	console.log('performing hittting');
        that.cords.reduce(function(prev, curr) {
            that.field.cells[curr[1]][curr[0]] = '#';
        }, 0);
        that.field.element = null;
    }

    var X = dir[0],
        Y = dir[1];
    var that = this;
    if (X * Y !== 0) {
        return false
    } //we can move only on horz or vert direction

    if (X !== 0) { //perform horz movement
        var valRes = that.validateHozMove(X);
        if (valRes.moveX) {
            applyMove(valRes.newCords)
        }
        return valRes.moveX;
    } else if (Y !== 0) { //perform vert movement
        var valRes = that.validateVertMove(Y);
        if (valRes.moveY) {
            applyMove(valRes.newCords)
        } else if (valRes.hitGround) {
            performHit();
        }
        return valRes.moveY;
    } else {
        return false
    }

};

var tetris = new Field({
    "w": 10,
    "h": 15
});


tetris.draw();
setInterval(function() {
    tetris.step();
}, 1000);
