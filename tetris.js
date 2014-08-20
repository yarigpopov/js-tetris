function Field(options) {
    this.width = options.w || 10;
    this.height = options.h || 15;
    this.cells = new Array(this.height);
    //initiolize cells
    for (var y = 0; y < this.height; y++) {
        this.cells[y] = new Array(this.width);
        for (var x = 0; x < this.width; x++) {
            this.cells[y][x] = '..';
        }
    }
    this.turn = 0;
    this.erased = 0;
}

Field.prototype.draw = function () {
};

Field.prototype.step = function () {
    this.turn++;
    console.log('Turn #', this.turn, Date());
    if (!this.element || this.element == undefined) {
        this.newElement();
    } else {
        if (this.element.move([0, 1])) {
            this.draw();
        }
    }
};

Field.prototype.checkErase = function (row) {
    var that = this;
    var doErase = this.cells[row].reduce(function (prev, currVal) {
        return (prev && (currVal === '#'))
    }, true);
    if (doErase) {
        for (var i = row; i > 0; i--) {
            var stop = that.cells[i].reduce(function (prev, currVal, index) {
                //if the in preveous row we have an element then forcing to erase with empty space;
                that.cells[i - 1][index] === '*' ? that.cells[i][index] = '..' : that.cells[i][index] = that.cells[i - 1][index];
                return prev || (currVal === '#')
            }, false);
            //if (stop) break;
        }
        this.erased++;
        this.checkErase(row);
    }


};

Field.prototype.newElement = function () {
    this.element = null;
    this.element = new Element(this);
    this.draw();
};

function Element(field) {
    function getShape(x, y) {
        var possible = [
            [
                [0, 0],
                [0, -1],
                [1, 0],
                [1, -1]
            ],
            [
                [0, -1],
                [0, 0],
                [0, 1],
                [0, 2]

            ],
            [
                [1, -1],
                [0, -1],
                [0, 0],
                [0, 1]
            ],
            [
                [-1, -1],
                [0, -1],
                [0, 0],
                [0, 1]
            ],
            [
                [0, -1],
                [1, -1],
                [0, 0],
                [-1, 0]
            ],
            [
                [0, -1],
                [-1, -1],
                [0, 0],
                [1, 0]
            ],
            [
                [0, -1],
                [0, 0],
                [1, 0],
                [0, 1]
            ]
        ];
        var shape = possible[Math.floor(Math.random() * possible.length)];
        return shape.map(function (val) {
            return [val[0] + x, val[1] + y]
        });
    }

    this.field = field;
    this.x = Math.floor((this.field.width - 1) / 2);
    this.y = 1;
    this.cords = getShape(this.x, this.y);
    this.cords.map(function (elm) {
        this.cells[elm[1]][elm[0]] = '*';
    }, this.field);
}

Element.prototype.rotate = function () {
    function validateRot() {
        function result() {
            return {
                "rotate": arguments[0],
                "newCords": arguments[1]
                // "comment": arguments[2]
            }
        }

        var canRot = true;
        var newCords = this.cords.map(function (value) {
            var newPoint = [(value[1] - this.y) + this.x, -(value[0] - this.x) + this.y];
            var field = this.field;
            //check horizontal conditions
            if (newPoint[0] < 0 || newPoint[0] >= field.width) {
                canRot = false
            } else {
                var pnt = this.field.cells[newPoint[1]][newPoint[0]];
                if (!(pnt == '..' || pnt == '*')) {
                    canRot = false
                }
            }
            ;
            //check vertical conditions
            if (newPoint[1] < 0) {
                canRot = false
            } else if (newPoint[1] >= field.height) {
                canRot = false;
            } else {
                var pnt = this.field.cells[newPoint[1]][newPoint[0]];
                if (!(pnt == '..' || pnt == '*')) {
                    canRot = false
                }
            }

            return newPoint;
        }, this);
        return result(canRot, newCords);
    };

    function applyRot(that, newCords) {
        // console.log('Applying rotate to', newCords);
        that.cords.reduce(function (prev, curr) {
            that.field.cells[curr[1]][curr[0]] = '..';
        }, 0);
        newCords.reduce(function (prev, curr) {
            that.field.cells[curr[1]][curr[0]] = '*';
        }, 0);
        that.cords = newCords;
    };
    var valRot = validateRot.call(this);
    if (valRot.rotate) {

        applyRot(this, valRot.newCords);
    }
    ;
    return valRot.rotate;

};

Element.prototype.validateHozMove = function (X) {
    function result() {
        return {
            "moveX": arguments[0],
            "newCords": arguments[1]
            // "comment": arguments[2]
        }
    };

    var canMoveX = true;
    var newCords = this.cords.map(function (value) {
        var newPoint = [value[0] + X, value[1]];
        var field = this.field;
        if (newPoint[0] < 0 || newPoint[0] >= field.width) {
            canMoveX = false
        } else {
            var pnt = this.field.cells[newPoint[1]][newPoint[0]];
            if (!(pnt == '..' || pnt == '*')) {
                canMoveX = false
            }
        }
        ;
        return newPoint;
    }, this);
    return result(canMoveX, newCords);
};

Element.prototype.validateVertMove = function (Y) {
    function result() {
        return {
            "moveY": arguments[0],
            "newCords": arguments[1],
            "hitGround": arguments[2]
        }
    };

    var canMoveY = true;
    var hitGround = false;
    var newCords = this.cords.map(function (value) {
        var newPoint = [value[0], value[1] + Y];
        var field = this.field;
        if (newPoint[1] < 0) {
            canMoveY = false
        } else if (newPoint[1] >= field.height) {
            canMoveY = false;
            hitGround = true;
        } else {
            var pnt = this.field.cells[newPoint[1]][newPoint[0]];
            if (!(pnt == '..' || pnt == '*')) {
                canMoveY = false
                hitGround = true;
            }
        }
        return newPoint;
    }, this);
    return result(canMoveY, newCords, hitGround);
};


Element.prototype.move = function (dir) {
    function applyMove(newCords) {
        // console.log('Applying move to', newCords);
        that.cords.reduce(function (prev, curr) {
            that.field.cells[curr[1]][curr[0]] = '..';
        }, 0);
        newCords.reduce(function (prev, curr) {
            that.field.cells[curr[1]][curr[0]] = '*';
        }, 0);
        that.cords = newCords;
        that.x = that.x + dir[0];
        that.y = that.y + dir[1];
    };

    function performHit() {
        console.log('performing hittting');
        that.cords.reduce(function (prev, curr) {
            that.field.cells[curr[1]][curr[0]] = '#';
        }, 0);

        that.cords.reduce(function (prev, curr) {
            that.field.checkErase(curr[1]);
        }, 0);
        that.field.newElement();
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

function TetrisElement(field) {
    Element.call(this, field)
    this.isDropping = false;
}

TetrisElement.prototype = Object.create(Element.prototype);

function Tetris(options) {
    Field.call(this, options);
    this.level = options.level || 0;
    this.delay = options.delay || 2000;
    this.intervalID = null;
};

Tetris.prototype = Object.create(Field.prototype);
Tetris.prototype.parent = Field.prototype;

Tetris.prototype.nextLevel = function () {
    this.level++;
    if (this.intervalID) {
        clearInterval(this.intervalID);
    }
    this.delay = 1500 * Math.pow(0.8, this.level - 1);
    var that = this;
    this.intervalID = setInterval(function () {
        that.step();
    }, this.delay);
}

Tetris.prototype.endGame = function () {
    if (this.intervalID) {
        clearInterval(this.intervalID);
    }
    if (this.performEndGame) this.performEndGame();
}


Tetris.prototype.move = function (dir) {
    if (!this.element) return;
    if (tetris.element.move(dir)) {
        tetris.draw();
    }
};

Tetris.prototype.rotate = function () {
    if (!this.element) return;
    if (this.element.rotate()) {
        this.draw();
    }
    ;
}

Tetris.prototype.drop = function () {
    console.log('drop');
    if (!this.element) return;
    if (!this.element.isDropping) return;
    if (tetris.element.move([0, 1])) {
        var that = this;
        this.draw();
        setTimeout(function () {
            that.drop();
        }, 50);
    }
}


Tetris.prototype.newElement = function () {
    this.element = null;
    this.element = new TetrisElement(this);
    console.log('newElement' + this.element.isDropping);
    this.draw();
    var that = this;
    if (that.element.cords.reduce(function (prev, curr) {
        return that.cells[curr[1] + 1][curr[0]] === '#'; //hack need to rewrite for checking on the stage of creating
    }, false)) {
        that.endGame();

    }
}

Tetris.prototype.checkErase = function (row) {
    this.parent.checkErase.call(this, row);
    while (this.erased >= 5 * this.level) {
        this.nextLevel();
    }
}

var tetris = new Tetris({
    "w": 10,
    "h": 17
});

tetris.draw = function () {
    var container = $('#tetris');

    var row, renderHtml = [];
    for (var y = 0; y < this.height; y++) {
        row = [];
        row.push('<ul class="row">');
        for (var x = 0; x < this.width; x++) {
            switch (this.cells[y][x]) {
                case '..':
                    row.push('<li></li>');
                    break;
                case '*':
                    row.push('<li class="element"></li>');
                    break;
                case '#':
                    row.push('<li class="ground"></li>');
                    break;
                default:
            }
        }
        ;
        row.push('</ul>');
        renderHtml.push(row.join(''));
    }
    container.html('');
    container.append(renderHtml.join(''));
    var stats = $('#stats');
    stats.html('');
    var statTemplate = _.template("<h5>Level: <%= level %> Rows <%= erased %></h5>");
    stats.append(statTemplate(tetris));
}

tetris.performEndGame = function () {
    $('#tetris').hide();
    $('#buttons').hide();
    $('#end-game').show();
};

tetris.draw();
tetris.nextLevel();

$$('li.element').swipeLeft(function (event) {
    tetris.move([-1, 0])
    event.preventDefaults();
});
$$('li.element').swipeDown(function (event) {
    if (tetris.element && !tetris.element.isDropping) {
        tetris.element.isDropping = true;
        tetris.drop();
    }
    event.preventDefaults();
});
$$('li.element').tap(function (event) {
    tetris.rotate();
    event.preventDefaults();
});
$$('li.element').swipeRight(function (event) {
    tetris.move([1, 0])
    event.preventDefaults();
});


$(document).keydown(function (e) {
    switch (e.which) {
        case 37: // left
            tetris.move([-1, 0]);
            break;

        case 38: // up
            tetris.rotate();
            break;

        case 39: // right
            tetris.move([1, 0]);
            break;

        case 40: // down
            tetris.move([0, 1]);
            break;
        case 32: // blank
            if (tetris.element && !tetris.element.isDropping) {
                tetris.element.isDropping = true;
                tetris.drop();
            }
            ;


            break;

        default:
            return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});
