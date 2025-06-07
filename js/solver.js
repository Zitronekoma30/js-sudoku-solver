const cellElements = [];
const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
let puzzle = [];

document.addEventListener('DOMContentLoaded', function() {
    createGrid();
    setupEventListeners();
    loadSudoku();
});

async function loadSudoku() {
    try {
        const response = await fetch('https://sudoku-api.vercel.app/api/dosuku?query={newboard(limit:1){grids{value,solution,difficulty}}}');
        const data = await response.json();
        puzzle = data.newboard.grids[0].value;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = puzzle[row][col];
                if (value !== 0) {
                    solveCell(row, col, value);
                }
            }
        }
    } catch (error) {
        console.error('Failed to load puzzle:', error);
        loadFallbackPuzzle();
    }

    updateOpts();
}

function loadFallbackPuzzle() {
    const fallback = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const value = fallback[row][col];
            if (value !== 0) {
                solveCell(row, col, value);
            }
        }
    }
}

function createGrid() {
    const gridContainer = document.getElementById('sudoku-grid');

    for (let row = 0; row < 9; row++) {
        cellElements[row] = [];
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            cell.addEventListener('click', function() {
                console.log(`Clicked cell [${row}, ${col}]`);
            });

            gridContainer.appendChild(cell);
            cellElements[row][col] = cell;
        }
    }
}

function getCell(row, col) {
    return cellElements[row][col];
}

function updateCell(row, col, isSolved, value, candidates) {
    const cell = getCell(row, col);

    if (isSolved) {
        cell.innerHTML = `<div class="solved-number">${value}</div>`;
        cell.classList.add('solved');
    } else {
        cell.innerHTML = candidates.map(n => `<span class="candidate">${n}</span>`).join('');
        cell.classList.remove('solved');
    }
}

function fillCandidates(row, col, candidates) {
    const cell = getCell(row, col);
    cell.innerHTML = '';

    candidates.forEach(num => {
        const span = document.createElement('span');
        span.textContent = num;
        span.className = 'candidate';
        cell.appendChild(span);
    });

    cell.classList.remove('solved');
}

function solveCell(row, col, value) {
    updateCell(row, col, true, value, []);
}

function clearCell(row, col) {
    const cell = getCell(row, col);
    cell.innerHTML = '';
    cell.classList.remove('solved');
}

function clearGrid() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            clearCell(row, col);
        }
    }
}

function getOptions(x, y) {
    let found = new Set();
    // check vert
    for (let i = 0; i < 9; i++) {
        let curr = puzzle[x][i];
        if (Array.isArray(curr) || curr === 0) continue;
        found.add(curr);
    }

    //check horiz
    for (let i = 0; i < 9; i++) {
        let curr = puzzle[i][y];
        if (Array.isArray(curr) || curr === 0) continue;
        found.add(curr);
    }

    //check square
    let square_x = Math.floor(x / 3);
    let square_y = Math.floor(y / 3);

    for (let i = square_x * 3; i < square_x * 3 + 3; i++) {
        for (let j = square_y * 3; j < square_y * 3 + 3; j++) {
            let curr = puzzle[i][j];
            if (Array.isArray(curr) || curr === 0) continue;
            found.add(curr);
        }
    }

    let opts = nums.filter(x => !found.has(x));
    return opts;
}

function findOnlyOptions(x, y) {
    if (!Array.isArray(puzzle[x][y])) return null;

    let opts = puzzle[x][y];

    let rowOptions = new Set();
    for (let i = 0; i < 9; i++) {
        if (i !== y && Array.isArray(puzzle[x][i])) {
            puzzle[x][i].forEach(opt => rowOptions.add(opt));
        }
    }

    let colOptions = new Set();
    for (let i = 0; i < 9; i++) {
        if (i !== x && Array.isArray(puzzle[i][y])) {
            puzzle[i][y].forEach(opt => colOptions.add(opt));
        }
    }

    let squareOptions = new Set();
    let square_x = Math.floor(x / 3);
    let square_y = Math.floor(y / 3);
    for (let i = square_x * 3; i < square_x * 3 + 3; i++) {
        for (let j = square_y * 3; j < square_y * 3 + 3; j++) {
            if ((i !== x || j !== y) && Array.isArray(puzzle[i][j])) {
                puzzle[i][j].forEach(opt => squareOptions.add(opt));
            }
        }
    }

    for (let option of opts) {
        if (!rowOptions.has(option) || !colOptions.has(option) || !squareOptions.has(option)) {
            return option;
        }
    }

    return null;
}

function updateOpts() {
    // find all new options
    for (let x = 0; x < puzzle.length; x++) {
        for (let y = 0; y < puzzle[x].length; y++) {
            if (puzzle[x][y] == 0 || Array.isArray(puzzle[x][y])) {
                let opts = getOptions(x, y);
                puzzle[x][y] = opts;
                fillCandidates(x, y, opts);
            }
        }
    }
}

function nextStep() {
    // fill singles
    for (let x = 0; x < puzzle.length; x++) {
        for (let y = 0; y < puzzle[x].length; y++) {
            if (!Array.isArray(puzzle[x][y])) {
                continue;
            }
            if (puzzle[x][y].length == 1) {
                puzzle[x][y] = puzzle[x][y][0];
                solveCell(x, y, puzzle[x][y]);
                updateOpts();
            }
        }
    }

    // fill only options
    for (let x = 0; x < puzzle.length; x++) {
        for (let y = 0; y < puzzle[x].length; y++) {
            if (Array.isArray(puzzle[x][y])) {
                only = findOnlyOptions(x, y);
                if (only !== null) {
                    puzzle[x][y] = only;
                    solveCell(x, y, only);
                    updateOpts();
                }
            }
        }
    }
}

function setupEventListeners() {
    document.getElementById('next-btn').addEventListener('click', function() { nextStep() });

    document.getElementById('clear-btn').addEventListener('click', function() {
        clearGrid();
        console.log('Grid cleared!');
    });
}
