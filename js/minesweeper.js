minesweeper = {
    rootElement: 'minesweeper',
    //gridType: 'square', // square / losange / circle / rectangle
    gridSize: 10, // 10 or {w:10,h:10}
    numberOfMines: 10,
    grid: [],
    mineValue: -1,
    manyMinesOnOnePosition: false,
    flagEnabled: false,
    aroundPositions: {},

    init: function() {
        if (this.numberOfMines === null) {
            this.numberOfMines = this.gridSize;
        }
        this.aroundPositions = {
            'tl': 0 - this.gridSize - 1,
            't' : 0 - this.gridSize,
            'tr': 0 - this.gridSize + 1,
            'l' : 0 - 1,
            'r' : 1,
            'bl': this.gridSize - 1,
            'b' : this.gridSize,
            'br': this.gridSize + 1
        };

        this.reset();

        this.attachButtonEvents();
    },
    reset: function() {
        this.grid = Array.apply(null, Array(this.gridSize * this.gridSize)).map(Number.prototype.valueOf, 0);
        document.getElementById(this.rootElement).innerHTML = '';

        document.getElementById('gameover-popin').classList.add('hidden');
        document.getElementById('minesweeper').classList.remove('disable');

        this.addMines();
        this.buildGrid();
    },
    addMines() {
        var inc = 0,
            pos = 0,
            maxLoop = 10000;
        for(var i = 0; i < maxLoop; i++) {
            pos = this.getRandom(0, this.gridSize * this.gridSize - 1);

            if (this.manyMinesOnOnePosition === true || this.grid[pos] > this.mineValue) {
                this.grid[pos] = (this.grid[pos] <= this.mineValue) ? this.grid[pos] + this.mineValue : this.mineValue;
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

        return (this.grid[gridPosition] > this.mineValue);
    },
    getRandom: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    buildGrid() {
        var row = '', cell = '', k = 0;

        for (var i = 0; i < this.gridSize; i++) {
            row = document.createElement('div');
            row.classList.add('row');

            for (var j = 0; j < this.gridSize; j++) {
                cell = document.createElement('div');
                cell.setAttribute('data-cell-number', k);
                cell.classList.add('cell');
                cell.innerHTML = '&nbsp;';
                row.appendChild(cell);

                k++;
            }
            document.getElementById(this.rootElement).appendChild(row);
        }
    },
    getScore: function() {
        var visiblesElements = document.querySelectorAll('div[data-visible="1"]').length;

        return Math.round(visiblesElements / (this.grid.length - this.numberOfMines) * 100);
    },
    refreshScore: function() {
        document.getElementById('score_complete').style.width = this.getScore() + '%';
    },
    play: function() {
        var self = this;
        document.getElementById(this.rootElement).addEventListener('click', function(e) {
            e.preventDefault();

            self.showCell(e.target);
        }, self);

        document.getElementById(this.rootElement).addEventListener('touch', function(e) {
            e.preventDefault();

            self.showCell(e.target);
        }, self);
    },
    attachButtonEvents: function() {
        var self = this;

        document.getElementById('btn-flag').addEventListener('click', function(e) {
            self.flagEnabled = !parseInt(e.target.getAttribute('data-active'));
            e.target.setAttribute('data-active', self.flagEnabled * 1);

            e.preventDefault();
        }, self);

        document.getElementById('btn-options').addEventListener('click', function(e) {
            e.preventDefault();

            /* @todo */
        }, self);

        document.getElementById('btn-reset').addEventListener('click', function(e) {
            e.preventDefault();

            self.reset();
        }, self);

        document.getElementById('gameover-popin').addEventListener('click', function(e) {
            e.preventDefault();

            e.stopPropagation();
            e.target.classList.add('hidden');
            self.reset();
        }, self);
    },
    showCell(elm) {
        var self = this,
            cellPosition = parseInt(elm.getAttribute('data-cell-number')),
            cellValue = this.grid[cellPosition],
            hasFlag = parseInt(elm.getAttribute('data-has-flag')),
            flag = 0,
            isVisible = parseInt(elm.getAttribute('data-visible')),
            innerHtml = '&nbsp;',
            className = 'empty_cell';

        if (
            typeof elm.getAttribute('data-cell-number') === 'undefined' ||
            this.grid[parseInt(elm.getAttribute('data-cell-number'))] === 'undefined' ||
            isVisible === 1
        ) {
            return;
        }

        if (hasFlag > 0) {
            flag = hasFlag - 1;
        } else if (this.flagEnabled) {
            flag = 2;
        }

        elm.classList.remove('flag_0', 'flag_1', 'flag_2');
        if (flag > 0 || this.flagEnabled) {
            elm.setAttribute('data-has-flag', flag);
            elm.classList.add('flag_' . flag);
            return;
        }

        elm.setAttribute('data-visible', 1);

        if (cellValue === 0) {
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

            this.gameOver();
        }

        elm.innerHTML = innerHtml;
        elm.classList.add(className);

        if (cellValue >= 0) {
            this.refreshScore();
        }
    },
    gameOver: function() {
        document.getElementById('gameover-popin').classList.remove('hidden');
        document.getElementById('minesweeper').classList.add('disable');
    }
};

document.addEventListener("DOMContentLoaded", function(e) {
    minesweeper.init();

    minesweeper.play();
});
