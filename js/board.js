//Клас для управління шаховою дошкою
class ChessBoard {
    constructor() {
        this.boardElement = document.getElementById('chess-board');
        this.selectedSquare = null;
        this.currentPlayer = 'white';

        //Початковий стан дошки (8x8 масив)
        this.board = this.createEmptyBoard();

        this.init();
    }

    //Ініціалізація дошки
    init() {
        this.createBoardSquares();
        this.setupInitialPosition();
        this.addEventListeners();

        console.log('Шахова дошка ініціалізована');
    }

    //Створення порожньої дошки 8x8
    createEmptyBoard() {
        const board = [];
        for (let row = 0; row < 8; row++) {
            board[row] = [];
            for (let col = 0; col < 8; col++) {
                board[row][col] = null;
            }
        }
        return board;
    }

    //Створення HTML елементів для клітинок дошки
    createBoardSquares() {
        //Очищення дошки
        this.boardElement.innerHTML = '';

        //Створення 64 клітинок
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = this.getSquareClass(row, col);
                square.dataset.row = row;
                square.dataset.col = col;
                square.dataset.square = this.getSquareNotation(row, col);

                this.boardElement.appendChild(square);
            }
        }
    }

    //Визначення CSS класу для клітинки
    getSquareClass(row, col) {
        const isLight = (row + col) % 2 === 0;
        return `square ${isLight ? 'light' : 'dark'}`;
    }

    //Конвертація координат в шахову нотацію
    getSquareNotation(row, col) {
        const file = String.fromCharCode('a'.charCodeAt(0) + col);
        const rank = 8 - row;
        return file + rank;
    }

    //Конвертація шахової нотації в координати
    notationToCoords(notation) {
        const file = notation.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = parseInt(notation[1]) - 1;
        return {
            row: 8 - rank - 1,
            col: file
        };
    }

    //Початкова розстановлення фігур
    setupInitialPosition() {
        //Очищення дошки
        this.board = this.createEmptyBoard();

        //Стандартна початкова позиція шахів
        const initialPosition = {
            //Білі фігури (нижня частина)
            'a1': 'white-rook',   'b1': 'white-knight', 'c1': 'white-bishop', 'd1': 'white-queen',
            'e1': 'white-king',   'f1': 'white-bishop', 'g1': 'white-knight', 'h1': 'white-rook',

            //Білі пєшки
            'a2': 'white-pawn',   'b2': 'white-pawn',   'c2': 'white-pawn',   'd2': 'white-pawn',
            'e2': 'white-pawn',   'f2': 'white-pawn',   'g2': 'white-pawn',   'h2': 'white-pawn',

            //Чорні пєшки
            'a7': 'black-pawn',   'b7': 'black-pawn',   'c7': 'black-pawn',   'd7': 'black-pawn',
            'e7': 'black-pawn',   'f7': 'black-pawn',   'g7': 'black-pawn',   'h7': 'black-pawn',

            //Чорні фігури (верхня частина)
            'a8': 'black-rook',   'b8': 'black-knight', 'c8': 'black-bishop', 'd8': 'black-queen',
            'e8': 'black-king',   'f8': 'black-bishop', 'g8': 'black-knight', 'h8': 'black-rook'
        };

        //Розстановлення фігур
        for (const [square, piece] of Object.entries(initialPosition)) {
            const coords = this.notationToCoords(square);
            this.board[coords.row][coords.col] = piece;
        }

        //Відображення фігур на дошці
        this.renderPieces();

        console.log('Фігури розставлені у початкову позицію');
    }

    //Відображення фігур на дошці
    renderPieces() {
        //Очищення всіх фігур
        document.querySelectorAll('.piece').forEach(piece => piece.remove());

        //Відображення фігур з масиву board
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    this.renderPiece(row, col, piece);
                }
            }
        }
    }

    //Відображення однієї фігури
    renderPiece(row, col, pieceType) {
        const square = this.getSquareElement(row, col);
        const pieceElement = document.createElement('div');

        const [color, type] = pieceType.split('-');
        pieceElement.className = `piece ${color} ${type}`;
        pieceElement.draggable = true;

        square.appendChild(pieceElement);
    }

    //Отримання HTML елемента клітинки
    getSquareElement(row, col) {
        return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    //Додавання event listeners
    addEventListeners() {
        this.boardElement.addEventListener('click', (e) => {
            this.handleSquareClick(e);
        });

        //Dragend подія для фігур
        this.boardElement.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('piece')) {
                this.handleDragStart(e);
            }
        });
    }

    //Обробка кліків по клітинкам
    handleSquareClick(e) {
        const square = e.target.closest('.square');
        if (!square) return;

        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const notation = square.dataset.square;

        console.log(`Клік по клітинці: ${notation} (${row}, ${col})`);

        //Якщо клітинка вже виділена
        if (this.selectedSquare) {
            //Якщо клікнуто по тій же клітинці - скасування виділення
            if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
                this.deselectSquare();
                return;
            }

            //Спроба зробити хід
            this.attemptMove(this.selectedSquare, {row, col, notation});
        } else {
            //Виділення клітинки з фігурою
            if (this.board[row][col]) {
                this.selectSquare(row, col, notation);
            }
        }
    }

    //Виділення клітинки
    selectSquare(row, col, notation) {
        this.deselectSquare(); // Скасування попереднього виділення

        const piece = this.board[row][col];
        if (!piece) return;

        //Перевірка чи це фігура поточного гравця
        const pieceColor = piece.split('-')[0];
        if (pieceColor !== this.currentPlayer) {
            console.log('Не ваша черга');
            return;
        }

        const squareElement = this.getSquareElement(row, col);
        squareElement.classList.add('selected');

        this.selectedSquare = {row, col, notation};

        console.log(`Виділено клітинку: ${notation}`);

        //Можливі ходи
        this.showPossibleMoves(row, col);
    }

    //Показ можливих ходів для фігури
    showPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return;

        const pieceColor = piece.split('-')[0];
        const possibleMoves = getPossibleMovesForSquare(this.board, row, col);
        const legalMoves = [];

        //Фільтрація тільки можливих ходів
        possibleMoves.forEach(move => {
            if (!wouldLeaveKingInCheck(this.board, row, col, move.row, move.col, pieceColor)) {
                legalMoves.push(move);
                const squareElement = this.getSquareElement(move.row, move.col);
                squareElement.classList.add('possible-move');
            }
        });

        console.log(`Знайдено ${legalMoves.length} ходів з ${possibleMoves.length} можливих`);

        //Якщо немає можливих ходів і король під шахом = мат
        if (legalMoves.length === 0 && isKingInCheck(this.board, pieceColor)) {
            console.log('Немає ходів - мат.');
        }
    }

    //Скасування виділення
    deselectSquare() {
        if (this.selectedSquare) {
            const squareElement = this.getSquareElement(
                this.selectedSquare.row,
                this.selectedSquare.col
            );
            squareElement.classList.remove('selected');

            this.selectedSquare = null;
        }

        //Скасування підсвічування можливих ходів
        document.querySelectorAll('.possible-move').forEach(square => {
            square.classList.remove('possible-move');
        });
    }

    //Спроба зробити хід з валідацією
    attemptMove(from, to) {
        console.log(`Спроба ходу: ${from.notation} -> ${to.notation}`);

        //Перевірка чи є фігура на початковій клітинці
        const piece = this.board[from.row][from.col];
        if (!piece) {
            console.log('Немає фігури для переміщення');
            this.deselectSquare();
            return;
        }

        //Перевірка чи це фігура поточного гравця
        const pieceColor = piece.split('-')[0];
        if (pieceColor !== this.currentPlayer) {
            console.log('Не ваша черга');
            this.deselectSquare();
            return;
        }

        //Перевірка чи є на цільовій клітинці своя фігура
        const targetPiece = this.board[to.row][to.col];
        if (targetPiece) {
            const targetColor = targetPiece.split('-')[0];
            if (targetColor === this.currentPlayer) {
                console.log('Не можна бити свою фігуру');
                this.deselectSquare();
                return;
            }
        }

        //Валідація ходу згідно з правилами фігури
        if (!isValidPieceMove(this.board, from.row, from.col, to.row, to.col)) {
            console.log('Неправильний хід для цієї фігури');
            this.deselectSquare();
            return;
        }

        //Перевірка чи хід залишить короля під шахом
        if (wouldLeaveKingInCheck(this.board, from.row, from.col, to.row, to.col, this.currentPlayer)) {
            console.log('Цей хід залишить короля під шахом.Хід неможливий.');
            this.deselectSquare();
            return;
        }

        //Виконання ходу
        this.makeMove(from, to);
    }

    //Виконання ходу з перевіркою шаху/мату
    makeMove(from, to) {
        const piece = this.board[from.row][from.col];
        const capturedPiece = this.board[to.row][to.col];

        //Переміщення фігури в масиві
        this.board[to.row][to.col] = piece;
        this.board[from.row][from.col] = null;

        //Оновлення відображення
        this.renderPieces();

        //Збереження інформації про хід
        const moveInfo = {
            from: from,
            to: to,
            piece: piece,
            capturedPiece: capturedPiece
        };

        //Зміна гравця
        const previousPlayer = this.currentPlayer;
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        //Перевірка статусу гри після ходу
        this.checkGameStatus();

        //Скасування виділення
        this.deselectSquare();

        console.log(`Хід виконано: ${from.notation} -> ${to.notation}`);
        console.log(`Тепер хід: ${this.currentPlayer}`);

        //Додавання до історії ходів
        if (window.chessGame) {
            window.chessGame.addMoveToHistory(from.notation, to.notation, piece, capturedPiece);
        }
    }

    //Перевірка статусу гри (шах, мат, пат)
    checkGameStatus() {
        const currentPlayerColor = this.currentPlayer;
        const isCheck = isKingInCheck(this.board, currentPlayerColor);
        const isMate = isCheckmate(this.board, currentPlayerColor);
        const isStale = isStalemate(this.board, currentPlayerColor);

        //Скасування попередніх підсвічувань
        document.querySelectorAll('.check').forEach(square => {
            square.classList.remove('check');
        });

        if (isMate) {
            //Мат
            const winnerColor = currentPlayerColor === 'white' ? 'чорних' : 'білих';
            this.updateCurrentPlayerDisplay(`🏆 МАТ! Переміг ${winnerColor}!`);
            this.updateGameStatus(`Гра закінчена! Мат. Переможець: ${winnerColor}`);

            //Підсвічування короля під шахом
            this.highlightKingInCheck(currentPlayerColor);

            console.log(`Мат. Переможець: ${winnerColor}`);

        } else if (isStale) {
            //Пат - нічия
            this.updateCurrentPlayerDisplay('Пат - нічия.');
            this.updateGameStatus('Гра закінчена. Пат - нічия.');

            console.log('Пат - нічия.');

        } else if (isCheck) {
            //Шах
            const playerName = currentPlayerColor === 'white' ? 'білих' : 'чорних';
            this.updateCurrentPlayerDisplay(`Шах. Хід ${playerName}`);
            this.updateGameStatus(`Шах королю ${playerName}`);

            //Підсвічування короля під шахом
            this.highlightKingInCheck(currentPlayerColor);

            console.log(`Шах королю ${playerName}`);

        } else {
            //Звичайний хід
            const playerName = currentPlayerColor === 'white' ? 'білих' : 'чорних';
            this.updateCurrentPlayerDisplay(`Хід ${playerName}`);
            this.updateGameStatus('Гра триває...');
        }
    }

    //Підсвічування короля під шахом
    highlightKingInCheck(kingColor) {
        const kingPos = findKing(this.board, kingColor);
        if (kingPos) {
            const kingSquare = this.getSquareElement(kingPos.row, kingPos.col);
            kingSquare.classList.add('check');
        }
    }

    //Оновлення відображення поточного гравця
    updateCurrentPlayerDisplay(message) {
        const currentTurnElement = document.getElementById('current-turn');
        if (currentTurnElement) {
            currentTurnElement.textContent = message || `Хід ${this.currentPlayer === 'white' ? 'білих' : 'чорних'}`;
        }
    }

    //Оновлення статусу гри
    updateGameStatus(message) {
        if (window.chessGame) {
            window.chessGame.updateGameStatus(message);
        }
    }

    //Обробка початку перетягування
    handleDragStart(e) {
        const piece = e.target;
        const square = piece.parentElement;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);

        //Перевірка чи це фігура поточного гравця
        const pieceColor = piece.classList.contains('white') ? 'white' : 'black';
        if (pieceColor !== this.currentPlayer) {
            e.preventDefault();
            return;
        }

        this.selectSquare(row, col, square.dataset.square);
        piece.classList.add('dragging');
    }
}