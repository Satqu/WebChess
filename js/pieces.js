//Базовий клас для всіх шахових фігур
class Piece {
    constructor(color, type, row, col) {
        this.color = color;
        this.type = type;
        this.row = row;
        this.col = col;
        this.hasMoved = false;
    }

    //Отримання всіх можливих ходів
    getPossibleMoves(board) {
        throw new Error('getPossibleMoves must be implemented by subclass');
    }

    //Перевірка чи хід валідний
    isValidMove(board, toRow, toCol) {
        const possibleMoves = this.getPossibleMoves(board);
        return possibleMoves.some(move => move.row === toRow && move.col === toCol);
    }

    //Переміщення фігури
    moveTo(row, col) {
        this.row = row;
        this.col = col;
        this.hasMoved = true;
    }

    //Клонування фігури
    clone() {
        const cloned = new this.constructor(this.color, this.type, this.row, this.col);
        cloned.hasMoved = this.hasMoved;
        return cloned;
    }
}


//Клас пєшки
class Pawn extends Piece {
    constructor(color, row, col) {
        super(color, 'pawn', row, col);
    }


    getPossibleMoves(board) {
        const moves = [];
        const direction = this.color === 'white' ? -1 : 1;
        const startRow = this.color === 'white' ? 6 : 1;


        //Хід вперед
        const newRow = this.row + direction;
        if (isValidPosition(newRow, this.col) && isSquareEmpty(board, newRow, this.col)) {
            moves.push({ row: newRow, col: this.col });

            //Подвійний хід з початкової позиції
            if (this.row === startRow && isSquareEmpty(board, newRow + direction, this.col)) {
                moves.push({ row: newRow + direction, col: this.col });
            }
        }

        //Атака по діагоналі
        [-1, 1].forEach(colOffset => {
            const newCol = this.col + colOffset;
            if (isValidPosition(newRow, newCol) && isEnemyPiece(board, newRow, newCol, this.color)) {
                moves.push({ row: newRow, col: newCol });
            }
        });

        return moves;
    }
}


//Клас тури
class Rook extends Piece {
    constructor(color, row, col) {
        super(color, 'rook', row, col);
    }


    getPossibleMoves(board) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // вгору, вниз, вліво, вправо


        directions.forEach(([dRow, dCol]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = this.row + dRow * i;
                const newCol = this.col + dCol * i;

                if (!isValidPosition(newRow, newCol)) break;

                if (isSquareEmpty(board, newRow, newCol)) {
                    moves.push({ row: newRow, col: newCol });
                } else if (isEnemyPiece(board, newRow, newCol, this.color)) {
                    moves.push({ row: newRow, col: newCol });
                    break;
                } else {
                    break;
                }
            }
        });

        return moves;
    }
}


//Клас коня
class Knight extends Piece {
    constructor(color, row, col) {
        super(color, 'knight', row, col);
    }

    getPossibleMoves(board) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        knightMoves.forEach(([dRow, dCol]) => {
            const newRow = this.row + dRow;
            const newCol = this.col + dCol;

            if (isValidPosition(newRow, newCol)) {
                if (isSquareEmpty(board, newRow, newCol) ||
                    isEnemyPiece(board, newRow, newCol, this.color)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });

        return moves;
    }
}


//Клас слона
class Bishop extends Piece {
    constructor(color, row, col) {
        super(color, 'bishop', row, col);
    }

    getPossibleMoves(board) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // діагоналі

        directions.forEach(([dRow, dCol]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = this.row + dRow * i;
                const newCol = this.col + dCol * i;

                if (!isValidPosition(newRow, newCol)) break;

                if (isSquareEmpty(board, newRow, newCol)) {
                    moves.push({ row: newRow, col: newCol });
                } else if (isEnemyPiece(board, newRow, newCol, this.color)) {
                    moves.push({ row: newRow, col: newCol });
                    break;
                } else {
                    break;
                }
            }
        });

        return moves;
    }
}


//Клас ферзя
class Queen extends Piece {
    constructor(color, row, col) {
        super(color, 'queen', row, col);
    }

    getPossibleMoves(board) {
        const moves = [];
        //Ферзь = тура + слон
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1], // як тура
            [-1, -1], [-1, 1], [1, -1], [1, 1] // як слон
        ];

        directions.forEach(([dRow, dCol]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = this.row + dRow * i;
                const newCol = this.col + dCol * i;

                if (!isValidPosition(newRow, newCol)) break;

                if (isSquareEmpty(board, newRow, newCol)) {
                    moves.push({ row: newRow, col: newCol });
                } else if (isEnemyPiece(board, newRow, newCol, this.color)) {
                    moves.push({ row: newRow, col: newCol });
                    break;
                } else {
                    break;
                }
            }
        });

        return moves;
    }
}


//Клас короля
class King extends Piece {
    constructor(color, row, col) {
        super(color, 'king', row, col);
    }

    getPossibleMoves(board) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        directions.forEach(([dRow, dCol]) => {
            const newRow = this.row + dRow;
            const newCol = this.col + dCol;

            if (isValidPosition(newRow, newCol)) {
                if (isSquareEmpty(board, newRow, newCol) ||
                    isEnemyPiece(board, newRow, newCol, this.color)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });

        return moves;
    }
}


//Фабрика для створення фігур
class PieceFactory {
    static createPiece(type, color, row, col) {
        switch (type) {
            case 'pawn': return new Pawn(color, row, col);
            case 'rook': return new Rook(color, row, col);
            case 'knight': return new Knight(color, row, col);
            case 'bishop': return new Bishop(color, row, col);
            case 'queen': return new Queen(color, row, col);
            case 'king': return new King(color, row, col);
            default:
                throw new Error(`Unknown piece type: ${type}`);
        }
    }
}


//Перевірка можливих ходів для фігури на дошці
function getPossibleMovesForSquare(board, row, col) {
    const pieceString = board[row][col];
    if (!pieceString) return [];

    const [color, type] = pieceString.split('-');
    const piece = PieceFactory.createPiece(type, color, row, col);

    return piece.getPossibleMoves(board);
}


//Перевірка чи хід валідний
function isValidPieceMove(board, fromRow, fromCol, toRow, toCol) {
    const possibleMoves = getPossibleMovesForSquare(board, fromRow, fromCol);
    return possibleMoves.some(move => move.row === toRow && move.col === toCol);
}
