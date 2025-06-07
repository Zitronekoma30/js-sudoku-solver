const cellElements = [];

document.addEventListener('DOMContentLoaded', function() {
    createGrid();
    setupEventListeners();
});

function createGrid() {
    const gridContainer = document.getElementById('sudoku-grid');

    // Create 9x9 grid of cells
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

function setupEventListeners() {
    // Test button to demonstrate functionality
    document.getElementById('test-btn').addEventListener('click', function() {
        fillCandidates(0, 0, [1, 2, 3]);
        fillCandidates(0, 1, [4, 5]);
        solveCell(0, 2, 9);
        fillCandidates(1, 0, [6, 7, 8, 9]);
        solveCell(1, 1, 3);

        console.log('Test cells filled!');
    });

    // Clear button
    document.getElementById('clear-btn').addEventListener('click', function() {
        clearGrid();
        console.log('Grid cleared!');
    });
}
