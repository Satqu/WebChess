//Допоміжні функції для шахової гри


//Перевірка чи координати в межах дошки
function isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

//Конвертація шахової нотації в координати
function notationToPosition(notation) {
    if (!notation || notation.length !== 2) return null;

    const file = notation.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = parseInt(notation[1]) - 1;

    if (!isValidPosition(8 - rank - 1, file)) return null;

    return {
        row: 8 - rank - 1,
        col: file
    };
}

//Конвертація координат в шахову нотацію
function positionToNotation(row, col) {
    if (!isValidPosition(row, col)) return null;

    const file = String.fromCharCode('a'.charCodeAt(0) + col);
    const rank = 8 - row;
    return file + rank;
}

//Отримання кольору фігури з її типу
function getPieceColor(pieceType) {
    if (!pieceType) return null;
    return pieceType.split('-')[0];
}

//Отримання типу фігури
function getPieceType(pieceType) {
    if (!pieceType) return null;
    return pieceType.split('-')[1];
}

//Перевірка чи клітинка порожня
function isSquareEmpty(board, row, col) {
    if (!isValidPosition(row, col)) return false;
    return board[row][col] === null;
}

//Перевірка чи на клітинці ворожа фігура
function isEnemyPiece(board, row, col, playerColor) {
    if (!isValidPosition(row, col)) return false;
    const piece = board[row][col];
    if (!piece) return false;

    return getPieceColor(piece) !== playerColor;
}

//Перевірка чи на клітинці своя фігура
function isOwnPiece(board, row, col, playerColor) {
    if (!isValidPosition(row, col)) return false;
    const piece = board[row][col];
    if (!piece) return false;

    return getPieceColor(piece) === playerColor;
}

//Клонування дошки
function cloneBoard(board) {
    const cloned = [];
    for (let row = 0; row < 8; row++) {
        cloned[row] = [];
        for (let col = 0; col < 8; col++) {
            cloned[row][col] = board[row][col];
        }
    }
    return cloned;
}

//Отримання всіх фігур певного кольору
function getAllPieces(board, color) {
    const pieces = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && getPieceColor(piece) === color) {
                pieces.push({
                    row: row,
                    col: col,
                    type: piece,
                    notation: positionToNotation(row, col)
                });
            }
        }
    }

    return pieces;
}

//Знаходження короля
function findKing(board, color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece === `${color}-king`) {
                return { row, col };
            }
        }
    }
    return null;
}

//Перевірка чи клітинка атакується противником
function isSquareUnderAttack(board, row, col, byColor) {
    //Перевірка всіх фігур противника
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && getPieceColor(piece) === byColor) {
                //Отримання можливих ходів цієї фігури
                const moves = getPossibleMovesForSquare(board, r, c);
                //Перевірка чи може атакувати нашу клітинку
                if (moves.some(move => move.row === row && move.col === col)) {
                    return true;
                }
            }
        }
    }
    return false;
}

//Перевірка чи король під шахом
function isKingInCheck(board, kingColor) {
    const kingPos = findKing(board, kingColor);
    if (!kingPos) return false;

    const enemyColor = kingColor === 'white' ? 'black' : 'white';
    return isSquareUnderAttack(board, kingPos.row, kingPos.col, enemyColor);
}

//Перевірка чи хід залишає короля під шахом
function wouldLeaveKingInCheck(board, fromRow, fromCol, toRow, toCol, playerColor) {
    //Створення копії дошки
    const testBoard = cloneBoard(board);

    //Виконування тестового ходу
    const piece = testBoard[fromRow][fromCol];
    testBoard[toRow][toCol] = piece;
    testBoard[fromRow][fromCol] = null;

    //Перевірка чи король під шахом після цього ходу
    return isKingInCheck(testBoard, playerColor);
}

//Отримання всіх можливих ходів для гравця
function getAllLegalMoves(board, playerColor) {
    const legalMoves = [];

    //Перевірка всіх фігур гравця
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && getPieceColor(piece) === playerColor) {
                //Отримання можливих ходів фігури
                const possibleMoves = getPossibleMovesForSquare(board, row, col);

                //Фільтрація тільки можливих ходів (які не залишають короля під шахом)
                possibleMoves.forEach(move => {
                    if (!wouldLeaveKingInCheck(board, row, col, move.row, move.col, playerColor)) {
                        legalMoves.push({
                            from: { row, col },
                            to: { row: move.row, col: move.col },
                            piece: piece
                        });
                    }
                });
            }
        }
    }
    return legalMoves;
}

//Перевірка на мат
function isCheckmate(board, playerColor) {
    //Мат = король під шахом + немає можливих ходів
    if (!isKingInCheck(board, playerColor)) {
        return false; // Не шах, отже не мат
    }

    const legalMoves = getAllLegalMoves(board, playerColor);
    return legalMoves.length === 0;
}

//Перевірка на пат
function isStalemate(board, playerColor) {
    //Пат = король НЕ під шахом + немає можливих ходів
    if (isKingInCheck(board, playerColor)) {
        return false; // Якщо шах, то не пат
    }

    const legalMoves = getAllLegalMoves(board, playerColor);
    return legalMoves.length === 0;
}

//Форматування часу для таймера
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

//Дебаунс функція
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

//Генерування унікального ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

//Логування з часовою міткою
function logWithTimestamp(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

//Перевірка підтримки localStorage
function isLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

//Безпечне збереження в localStorage
function safeLocalStorageSet(key, value) {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage недоступний');
        return false;
    }

    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('Помилка збереження в localStorage:', e);
        return false;
    }
}

//Безпечне отримання з localStorage
function safeLocalStorageGet(key) {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage недоступний');
        return null;
    }

    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Помилка читання з localStorage:', e);
        return null;
    }
}
