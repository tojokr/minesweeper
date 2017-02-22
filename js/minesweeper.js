simon = {
    rootElement: 'minesweeper',
    gridSize: 10,
    numberOfMines: 10,
    grid: [],
    mineValue: -1,
    manyMinesOnOnePosition: false,
    aroundPositions: {},

    init: function() {
        if (this.numberOfMines === null) {
            this.numberOfMines = this.gridSize;
        }
        this.aroundPositions = {
            'tl': -this.gridSize - 1,
            't' : -this.gridSize,
            'tr': -this.gridSize + 1,
            'l' : -1,
            'r' : 1,
            'bl': this.gridSize - 1,
            'b' : this.gridSize,
            'br': this.gridSize + 1
        };

        this.grid = Array.apply(null, Array(this.gridSize * this.gridSize)).map(Number.prototype.valueOf, 0);

        this.addMines();
        this.buildGrid();
    },
    addMines() {
        var inc = 0,
            pos = 0,
            maxLoop = 10000;
        for(var i = 0; i < maxLoop; i++) {
            pos = this.getRandom(0, this.gridSize * this.gridSize - 1);
            if (this.manyMinesOnOnePosition === true || this.grid[pos] !== this.mineValue) {
                this.grid[pos] = (this.grid[pos] < 0) ? this.grid[pos] + this.mineValue : this.mineValue;
                inc++;
                this.addNumbersAroundPos(pos);
            }

            if (inc === this.numberOfMines) {
                break;
            }
        }
    },
    addNumbersAroundPos(pos) {
        for (var i in this.aroundPositions) {
            if (this.isAvailablePosition(i, pos, this.aroundPositions[i])) {
                this.grid[pos + this.aroundPositions[i]] = this.grid[pos + this.aroundPositions[i]] + 1;
            }
        }
    },
    isAvailablePosition(aroundPosition, currentPosition, deltaFromCurrentPosition) {
        var gridPosition = currentPosition + deltaFromCurrentPosition;

        if (
            typeof this.grid[gridPosition] === 'undefined' // Out of grid (top/bottom)
            || (aroundPosition.indexOf('l') !== -1 && currentPosition%this.gridSize === 0) // Left border
            || (aroundPosition.indexOf('r') !== -1 && currentPosition%this.gridSize === this.gridSize - 1) // Right border
        ) {
            return false;
        }

        return (this.grid[gridPosition] !== this.mineValue);
    },
    getRandom: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    buildGrid() {
        var c = '', className = '';
        for(var i = 0; i < this.grid.length; i++) {
            c = document.createElement('div');
            c.setAttribute('data-cell-number', i);
            c.innerHTML = '&nbsp;';
            document.getElementById(this.rootElement).appendChild(c);

            if (i % this.gridSize === (this.gridSize - 1)) {
                c = document.createElement('div');
                c.className = 'clearfix';
                document.getElementById(this.rootElement).appendChild(c);
            }
        }
    },
    play() {
        var self = this;
        document.getElementById(this.rootElement).addEventListener('click', function(event) {
            self.showCell(event.target);
        }, self);

        document.getElementById(this.rootElement).addEventListener('touch', function(event) {
            self.showCell(event.target);
        }, self);
    },
    showCell(elm) {
        if (
            typeof elm.getAttribute('data-cell-number') !== 'undefined' &&
            this.grid[parseInt(elm.getAttribute('data-cell-number'))] !== 'undefined'
        ) {
            var cellPosition = parseInt(elm.getAttribute('data-cell-number')),
                cellValue = this.grid[cellPosition],
                innerHtml = '',
                className = '';

            if (elm.getAttribute('data-has-flag') === '1') {
                elm.setAttribute('data-has-flag', '0');
                return;
            }

            if (elm.getAttribute('data-visible') === '1') {
                return;
            }

            elm.setAttribute('data-visible', '1');

            if (cellValue === 0) {
                innerHtml = '&nbsp;';
                className = 'empty_cell';

                // Recursive show around cells
                for (var i in this.aroundPositions) {
                    if (this.isAvailablePosition(i, cellPosition, this.aroundPositions[i])) {
                        var c = document.querySelectorAll('div[data-cell-number="' + (cellPosition + this.aroundPositions[i]) + '"]')[0];
                        this.showCell(c);
                    }
                }
            } else if (cellValue > 0) {
                innerHtml = cellValue;
                className = 'cell_number_' + cellValue;
            } else {
                innerHtml = 'X';
                className = 'cell_mine';
            }

            elm.innerHTML = innerHtml;
            elm.className = className;
        }
    }
};

document.addEventListener("DOMContentLoaded", function(event) {
    simon.init();

    simon.play();
});
