import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button
            className={'square ' + props.className}
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

function ToggleCheckbox(props) {
    return (
        <label>
            Sort moves {props.dir}
            <input
                type='checkbox'
                onChange={props.onCheckboxChange}
                checked={props.checked}
            />
        </label>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return <Square
            key={i}
            className={this.props.winners.indexOf(i) !== -1 ? 'winner' : ''}
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
        />;
    }

    render() {
        let rows = [];
        let squares = [];

        for (let i = 0; i < 3; i++) {

            for (let j = 0; j < 3; j++) {
                squares.push(this.renderSquare(i * 3 + j));
            }
            rows.push(<div key={i} className="board-row">{squares}</div>);
            squares = [];
        }

        return (
            <div>
                {rows}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                locationRow: null,
                locationCol: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            sortDir: 'asc',
            sortChecked: true,
        }
    }

    renderCheckbox = () => {
        return <ToggleCheckbox
            dir={this.state.sortDir}
            onCheckboxChange={this.handleCheckboxChange}
            checked={this.state.sortChecked}
        />;
    }

    handleCheckboxChange = (e) => {
        this.setState({
            sortDir: e.target.checked ? 'asc' : 'desc',
            sortChecked: e.target.checked
        });
    }

    handleClick = (i) => {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const locationRow = calculateLocationRow(i);
        const locationCol = calculateLocationCol(i);

        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';

        this.setState({
            history: history.concat([{
                squares: squares,
                locationRow: locationRow,
                locationCol: locationCol,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo = (step) => {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            let text;

            if (move) {
                text = 'Go to move #' + move + " - Row: " + (step.locationRow + 1) + ", Col: " + (step.locationCol + 1);
            } else {
                text = 'Go to game start';
            }

            return (
                <li key={move} className={move === this.state.stepNumber ? 'current-move' : ''}>
                    <button onClick={() => this.jumpTo(move)}>{text}</button>
                </li>
            );
        });

        if (this.state.sortDir === "desc") {
            moves.reverse();
        }

        let status;
        let winners;

        if (winner) {
            status = 'Winner: ' + winner.player;
            winners = winner.squares;

            if (winners.length > 3) {
                status += " with a double win!"
            }
        } else {
            if (this.state.stepNumber !== 9) {
                status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            } else {
                status = "Draw";
            }
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winners={winners || []}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol className='sort-wrap'>{this.renderCheckbox()}</ol>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    let player = '';
    let winningSquares = [];


    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            const iterator = lines[i].values();

            player = squares[a];
            for (const value of iterator) {
                winningSquares.push(value);
            }
        }
    }
    if (player) {
        return {
            player: player,
            squares: winningSquares
        };
    }
    return null;
}

function calculateLocationRow(i) {
    let index = Math.floor(i / 3);

    return index;
}

function calculateLocationCol(i) {
    let index = i % 3;

    return index;
}