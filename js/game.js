//Головний клас гри
class ChessGame {
    constructor() {
        this.board = null;
        this.gameStatus = 'playing'; // playing, check, checkmate, draw
        this.moveHistory = [];


        this.init();
    }


    //Ініціалізація гри
    init() {
        console.log('Ініціалізація гри');


        //Створення дошки
        this.board = new ChessBoard();


        //Налаштування UI елементів
        this.setupUI();


        console.log('Гра готова до початку');
    }


    //Налаштування UI
    setupUI() {
        //Кнопка - Нова гра
        const newGameBtn = document.getElementById('new-game-btn');
        newGameBtn.addEventListener('click', () => {
            this.startNewGame();
        });


        //Кнопка - Скинути
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => {
            this.resetGame();
        });


        //Кнопка - Скасувати хід
        const undoBtn = document.getElementById('undo-btn');
        undoBtn.addEventListener('click', () => {
            this.undoLastMove();
        });


        //Кнопка - Зберегти гру
        const saveBtn = document.getElementById('save-game-btn');
        saveBtn.addEventListener('click', () => {
            this.saveGame();
        });


        console.log('UI елементи налаштовані');
    }


    //Початок нової гри
    startNewGame() {
        console.log('Початок нової гри');


        //Підтвердження якщо гра вже йде
        if (this.moveHistory.length > 0) {
            const confirm = window.confirm('Розпочати нову гру? Поточну гру буде втрачено.');
            if (!confirm) return;
        }


        //Скидання стану гри
        this.gameStatus = 'playing';
        this.moveHistory = [];


        //Перезавантаження дошки
        this.board.setupInitialPosition();
        this.board.currentPlayer = 'white';
        this.board.updateCurrentPlayerDisplay();


        //Очищення історії ходів
        this.clearMoveHistory();


        //Оновлення статусу гри
        this.updateGameStatus('Гра розпочата. Хід білих.');


        console.log('Нову гру розпочато');
    }


    //Скидання гри
    resetGame() {
        this.startNewGame();
    }



    //Збереження гри
    saveGame() {
        const gameData = {
            board: this.board.board,
            currentPlayer: this.board.currentPlayer,
            moveHistory: this.moveHistory,
            gameStatus: this.gameStatus,
            timestamp: new Date().toISOString()
        };


        //Збереження в localStorage
        localStorage.setItem('chess-game-save', JSON.stringify(gameData));


        console.log('Гру збережено');
        alert('Гру успішно збережено.');
    }


    //Завантаження збереженої гри
    loadGame() {
        const savedData = localStorage.getItem('chess-game-save');


        if (!savedData) {
            console.log('Збереженої гри не знайдено');
            return false;
        }


        try {
            const gameData = JSON.parse(savedData);


            //Відновлення стану гри
            this.board.board = gameData.board;
            this.board.currentPlayer = gameData.currentPlayer;
            this.moveHistory = gameData.moveHistory || [];
            this.gameStatus = gameData.gameStatus;


            //Оновлення дошки
            this.board.renderPieces();
            this.board.updateCurrentPlayerDisplay();


            console.log('Гру завантажено');
            return true;
        } catch (error) {
            console.error('Помилка завантаження гри:', error);
            return false;
        }
    }


    //Додавання ходу в історію
    addMoveToHistory(from, to, piece, capturedPiece = null) {
        const move = {
            from: from,
            to: to,
            piece: piece,
            capturedPiece: capturedPiece,
            timestamp: new Date().toISOString()
        };


        this.moveHistory.push(move);
        this.updateMoveHistoryDisplay();
    }


    //Оновлення відображення історії ходів
    updateMoveHistoryDisplay() {
        const movesList = document.getElementById('moves-list');
        movesList.innerHTML = '';


        this.moveHistory.forEach((move, index) => {
            const moveElement = document.createElement('div');
            moveElement.className = 'move-item';


            const moveNumber = Math.floor(index / 2) + 1;
            const isWhiteMove = index % 2 === 0;


            if (isWhiteMove) {
                moveElement.textContent = `${moveNumber}. ${move.from}-${move.to}`;
            } else {
                moveElement.textContent = `${move.from}-${move.to}`;
            }


            movesList.appendChild(moveElement);
        });


        //Прокрутка до останнього ходу
        movesList.scrollTop = movesList.scrollHeight;
    }


    //Очищення історії ходів
    clearMoveHistory() {
        const movesList = document.getElementById('moves-list');
        movesList.innerHTML = '';
    }


    //Оновлення статусу гри
    updateGameStatus(message) {
        const statusElement = document.getElementById('game-status');
        if (statusElement) {
            statusElement.querySelector('p').textContent = message;
        }


        console.log(`Статус гри: ${message}`);
    }
}


//Ініціалізація гри при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM завантажено, запуск гри');


    //Створення глобального об'єкту гри
    window.chessGame = new ChessGame();


    //Спроба завантажити збережену гру
    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Завантажити гру';
    loadBtn.className = 'btn btn-secondary';
    loadBtn.style.marginLeft = '1rem';
    loadBtn.addEventListener('click', () => {
        if (window.chessGame.loadGame()) {
            alert('Гру завантажено.');
        } else {
            alert('Збереженої гри не знайдено.');
        }
    });


    //Додавання кнопки завантаження до контролів
    document.querySelector('.game-controls').appendChild(loadBtn);
});
