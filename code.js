let rows = 15;
let cols = 15;
let playing = false;

let timer;
let reproductionTime = 500;
let generation = 0; 
let allowDeath = true; 
let cellSize = 20; 
let grid = new Array(rows);
let nextGrid = new Array(rows);

document.addEventListener('DOMContentLoaded', () => {
    createTable();
    initializeGrids();
    resetGrids();
    setupControlButtons();
    setupToggleDeath();
    setupCellSizeChange();
    updateStats();
});

function setupToggleDeath() {
    const toggleDeathCheckbox = document.getElementById("toggleDeath");

    
    allowDeath = toggleDeathCheckbox.checked;

    
    toggleDeathCheckbox.addEventListener("change", () => {
        allowDeath = toggleDeathCheckbox.checked;
        console.log(`allowDeath změněno na: ${allowDeath}`);
    });
}

function setupCellSizeChange() {
    const cellSizeSelect = document.getElementById("cellSize");

    cellSize = parseInt(cellSizeSelect.value);

    cellSizeSelect.addEventListener("change", () => {
        cellSize = parseInt(cellSizeSelect.value);
        updateCellSizes();
    });
}

function updateCellSizes() {
    const cells = document.querySelectorAll("td");
    cells.forEach(cell => {
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
    });
}

function updateStats() {
    const liveCells = countLiveCells();
    document.getElementById("generationStat").textContent = `Generace: ${generation}`;
    document.getElementById("liveCellsStat").textContent = `Živé buňky: ${liveCells}`;
}

function countLiveCells() {
    let liveCells = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 1) {
                liveCells++;
            }
        }
    }
    return liveCells;
}

function resetGrids() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            grid[i][j] = 0;
            nextGrid[i][j] = 0;
        }
    }
    generation = 0;
    updateStats();
}

function initializeGrids() {
    for (let i = 0; i < rows; i++) {
        grid[i] = new Array(cols);
        nextGrid[i] = new Array(cols);
    }
}

function createTable() {
    let gridContainer = document.getElementById("gridContainer");
    if (!gridContainer) {
        console.error("Problem: no div for the grid table!");
        return;
    }

    let table = document.createElement("table");

    for (let i = 0; i < rows; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < cols; j++) {
            let cell = document.createElement("td");
            cell.setAttribute("id", i + "_" + j);
            cell.setAttribute("class", "dead");
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.onclick = cellClickHandler;
            tr.appendChild(cell);
        }
        table.appendChild(tr);
    }
    gridContainer.appendChild(table);
}

function cellClickHandler() {
    let rowcol = this.id.split("_");
    let row = parseInt(rowcol[0]);
    let col = parseInt(rowcol[1]);
    let classes = this.getAttribute('class');

    if (classes.indexOf('live') > -1) {
        this.setAttribute('class', 'dead');
        grid[row][col] = 0;
    } else {
        this.setAttribute('class', 'live');
        grid[row][col] = 1;
    }
    updateStats();
}

function setupControlButtons() {
    let startButton = document.querySelector('#start');
    let clearButton = document.querySelector('#clear');
    let rButton = document.querySelector('#random');

    startButton.onclick = () => {
        if (playing) {
            playing = false;
            startButton.innerHTML = 'start';
        } else {
            playing = true;
            startButton.innerHTML = 'pause';
            play();
        }
    };

    clearButton.onclick = () => {
        playing = false;
        startButton.innerHTML = "start";
        resetGrids();
        updateView();
    };

    rButton.onclick = () => {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                grid[i][j] = Math.floor(Math.random() * 2);
                var cell = document.getElementById(i + '_' + j);
                if (grid[i][j] === 1) cell.setAttribute('class', 'live');
                else cell.setAttribute('class', 'dead');
            }
        }
        updateStats();
    };
}

function play() {
    computeNextGen();

    if (playing) {
        timer = setTimeout(play, reproductionTime);
    }
}

function computeNextGen() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            applyRules(i, j);
        }
    }
    copyAndResetGrid();
    updateView();
    generation++;
    updateStats();
}

function copyAndResetGrid() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            grid[i][j] = nextGrid[i][j];
            nextGrid[i][j] = 0;
        }
    }
}

function updateView() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let cell = document.getElementById(i + '_' + j);
            if (grid[i][j] === 0) {
                cell.setAttribute('class', 'dead');
            } else {
                cell.setAttribute('class', 'live');
            }
        }
    }
}

function applyRules(row, col) {
    let numNeighbors = countNeighbors(row, col);

    if (grid[row][col] === 1) {
        if (allowDeath) {
            if (numNeighbors < 2 || numNeighbors > 3) {
                nextGrid[row][col] = 0;
            } else {
                nextGrid[row][col] = 1;
            }
        } else {
            nextGrid[row][col] = 1;
        }
    } else if (grid[row][col] === 0) {
        if (numNeighbors === 3) {
            nextGrid[row][col] = 1;
        }
    }
}

function countNeighbors(row, col) {
    let count = 0;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            let newRow = (row + i + rows) % rows;
            let newCol = (col + j + cols) % cols;
            count += grid[newRow][newCol];
        }
    }
    return count;
}
