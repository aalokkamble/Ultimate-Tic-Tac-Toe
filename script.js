let currentPlayer = 'X';
let gameActive = true;
let boardState = Array(9).fill('').map(() => Array(9).fill(''));
let mainBoardState = Array(9).fill('');
let nextBoardIndex = 4; // Start in the middle board (index 4)
const message = document.getElementById('message');
const restartButton = document.getElementById('restartButton');
const isComputerPlayer = true; // Make second player a computer

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Function to check for a win in a small board
const checkWin = (board) => {
    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return winningCombinations[i]; // Return the winning combination
        }
    }
    return board.includes('') ? null : 'draw';
};

// Function to highlight the winning line and gray out other cells
const highlightWinningLine = (boardIndex, winningCells) => {
    const cells = document.querySelectorAll(`.cell[data-board="${boardIndex}"]`);

    // Highlight the winning cells in blue
    winningCells.forEach(index => {
        cells[index].classList.add('winning-cell');
    });

    // Gray out the remaining cells
    for (let i = 0; i < 9; i++) {
        if (!winningCells.includes(i)) {
            cells[i].classList.add('grayed-out');
        }
    }
};

// Highlight the next board where the player must play
const highlightNextBoard = (boardIndex) => {
    document.querySelectorAll('.board').forEach((board, index) => {
        board.classList.remove('highlight');
        if (index === boardIndex && !mainBoardState[boardIndex]) {
            board.classList.add('highlight');
        }
    });
};

// Function for the AI to make a move
const computerMove = () => {
    if (!gameActive) return;

    // If the next board is full, choose any available board
    let availableBoards = [];
    if (nextBoardIndex === null || mainBoardState[nextBoardIndex]) {
        availableBoards = boardState
            .map((board, index) => (mainBoardState[index] === '' ? index : null))
            .filter(index => index !== null);
        nextBoardIndex = availableBoards[Math.floor(Math.random() * availableBoards.length)];
    }

    // Find available cells in the current board
    const availableCells = boardState[nextBoardIndex]
        .map((cell, index) => (cell === '' ? index : null))
        .filter(index => index !== null);

    if (availableCells.length > 0) {
        const randomCellIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
        boardState[nextBoardIndex][randomCellIndex] = 'O';
        document.querySelector(`.cell[data-board="${nextBoardIndex}"][data-index="${randomCellIndex}"]`).textContent = 'O';

        // Check for a winner after the AI's move
        const result = checkWin(boardState[nextBoardIndex]);
        if (result) {
            mainBoardState[nextBoardIndex] = 'O';
            document.getElementById(`board-${nextBoardIndex}`).style.backgroundColor = 'lightpink';

            highlightWinningLine(nextBoardIndex, result);

            message.textContent = `Player O wins the game on board ${nextBoardIndex + 1}!`;
            gameActive = false;
            return;
        } else if (result === 'draw') {
            mainBoardState[nextBoardIndex] = 'draw';
        }

        nextBoardIndex = randomCellIndex;

        if (mainBoardState[nextBoardIndex] || boardState[nextBoardIndex].every(cell => cell !== '')) {
            nextBoardIndex = null; // Allow the human to pick any board
        }

        message.textContent = `Player X, play in board ${nextBoardIndex + 1}`;
        highlightNextBoard(nextBoardIndex);
        currentPlayer = 'X';
    }
};

const handleCellClick = (event) => {
    const boardIndex = parseInt(event.target.getAttribute('data-board'));
    const cellIndex = parseInt(event.target.getAttribute('data-index'));

    // Prevent click if game is inactive or not the correct board
    if (!gameActive || (boardIndex !== nextBoardIndex && !mainBoardState[boardIndex])) {
        message.textContent = `You must play in board ${nextBoardIndex + 1}`;
        return;
    }

    // Prevent click if the cell is already filled
    if (boardState[boardIndex][cellIndex] !== '') return;

    // Mark the cell with the current player's symbol
    boardState[boardIndex][cellIndex] = currentPlayer;
    event.target.textContent = currentPlayer;

    // Check for a winner in the current board
    const result = checkWin(boardState[boardIndex]);

    if (result) {
        mainBoardState[boardIndex] = currentPlayer;
        document.getElementById(`board-${boardIndex}`).style.backgroundColor = 'lightblue';

        // Highlight the winning line and gray out other cells
        highlightWinningLine(boardIndex, result);

        // End the game when any small board is won
        message.textContent = `Player ${currentPlayer} wins the game on board ${boardIndex + 1}!`;
        gameActive = false;
        return;
    } else if (result === 'draw') {
        mainBoardState[boardIndex] = 'draw';
    }

    // Set the next board index based on the player's move
    nextBoardIndex = cellIndex;

    // If the next board is won or full, allow the player to pick any board
    if (mainBoardState[nextBoardIndex] || boardState[nextBoardIndex].every(cell => cell !== '')) {
        nextBoardIndex = null;
        message.textContent = `Player O, pick any board`;
    } else {
        message.textContent = `Player O, play in board ${nextBoardIndex + 1}`;
    }

    // Switch to AI turn
    currentPlayer = 'O';
    highlightNextBoard(nextBoardIndex);

    // Give the AI a slight delay before making its move
    setTimeout(() => {
        computerMove();
    }, 500);
};

// Restart the game and reset all states
const restartGame = () => {
    currentPlayer = 'X';
    gameActive = true;
    boardState = Array(9).fill('').map(() => Array(9).fill(''));
    mainBoardState = Array(9).fill('');
    nextBoardIndex = 4; // Start in the middle board
    message.textContent = `Player ${currentPlayer} starts in the center board`;

    // Clear the board and reset styles
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winning-cell', 'grayed-out');
    });
    document.querySelectorAll('.board').forEach(board => {
        board.style.backgroundColor = '';
        board.classList.remove('highlight');
    });

    highlightNextBoard(nextBoardIndex); // Highlight the first board
};

// Create the 9 individual Tic-Tac-Toe boards and cells
const createBoard = () => {
    for (let i = 0; i < 9; i++) {
        const board = document.getElementById(`board-${i}`);
        board.classList.add('board');
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-board', i);
            cell.setAttribute('data-index', j);
            board.appendChild(cell);
            cell.addEventListener('click', handleCellClick);
        }
    }
};

// Initialize the game
createBoard();
restartButton.addEventListener('click', restartGame);
message.textContent = `Player ${currentPlayer} starts in the center board`;
highlightNextBoard(nextBoardIndex); // Highlight the center board at the start
