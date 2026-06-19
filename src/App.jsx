import React, { useState, useEffect, useCallback } from 'react';
import './index.css';

// Helper: Calculate Winner
const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  if (!squares.includes(null)) return { winner: 'Draw', line: [] };
  return null;
};

// Main App Component
export default function App() {
  // Game Configuration State
  const [view, setView] = useState('menu'); // 'menu' | 'playing'
  const [mode, setMode] = useState('single'); // 'single' | 'multi'
  const [player1Marker, setPlayer1Marker] = useState('X');
  const [firstToMove, setFirstToMove] = useState('X');

  // Game Play State
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, Draws: 0 });

  // Derived State
  const winInfo = calculateWinner(board);
  const winner = winInfo?.winner;
  const winningLine = winInfo?.line || [];
  
  const aiMarker = player1Marker === 'X' ? 'O' : 'X';
  const isAITurn = mode === 'single' && !winner && ((xIsNext && aiMarker === 'X') || (!xIsNext && aiMarker === 'O'));

  // --- MINIMAX AI IMPLEMENTATION ---
  const minimax = useCallback((testBoard, depth, isMaximizing, aiMark, humanMark) => {
    const result = calculateWinner(testBoard);
    if (result) {
      if (result.winner === aiMark) return 10 - depth;
      if (result.winner === humanMark) return depth - 10;
      if (result.winner === 'Draw') return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!testBoard[i]) {
          testBoard[i] = aiMark;
          let score = minimax(testBoard, depth + 1, false, aiMark, humanMark);
          testBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!testBoard[i]) {
          testBoard[i] = humanMark;
          let score = minimax(testBoard, depth + 1, true, aiMark, humanMark);
          testBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }, []);

  const getBestMove = useCallback(() => {
    let bestScore = -Infinity;
    let move = -1;
    const testBoard = [...board];

    for (let i = 0; i < 9; i++) {
      if (!testBoard[i]) {
        testBoard[i] = aiMarker;
        let score = minimax(testBoard, 0, false, aiMarker, player1Marker);
        testBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }, [board, aiMarker, player1Marker, minimax]);

  // Handle AI Turn
  useEffect(() => {
    if (isAITurn) {
      const timer = setTimeout(() => {
        const bestMove = getBestMove();
        if (bestMove !== -1) {
          // AI executes its move directly via functional state updates 
          // This bypasses the click handler's lock and prevents stale closures
          setBoard(prevBoard => {
            const newBoard = [...prevBoard];
            newBoard[bestMove] = aiMarker;
            return newBoard;
          });
          setXIsNext(prev => !prev);
        }
      }, 600); // Slight delay for realism
      return () => clearTimeout(timer);
    }
  }, [isAITurn, getBestMove, aiMarker]);

  // Handle Win/Draw Scoring
  useEffect(() => {
    if (winner) {
      setScores(prev => ({
        ...prev,
        [winner === 'Draw' ? 'Draws' : winner]: prev[winner === 'Draw' ? 'Draws' : winner] + 1
      }));
    }
  }, [winner]);

  // Handlers
  const handleSquareClick = (index) => {
    // We only block clicks if the square is full, the game is over, OR it's the AI's turn
    if (board[index] || winner || isAITurn) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const startGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(firstToMove === 'X');
    setView('playing');
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(firstToMove === 'X');
  };

  const quitToMenu = () => {
    setView('menu');
    setScores({ X: 0, O: 0, Draws: 0 });
    setBoard(Array(9).fill(null));
  };

  // UI Components
  const renderSquare = (i) => {
    const isWinningSquare = winningLine.includes(i);
    const marker = board[i];
    const colorClass = marker === 'X' ? 'neon-text-x' : marker === 'O' ? 'neon-text-o' : '';

    return (
      <button
        key={i}
        className={`square ${isWinningSquare ? 'winning-square' : ''} ${colorClass}`}
        onClick={() => handleSquareClick(i)}
        disabled={!!marker || !!winner || isAITurn}
      >
        {marker}
      </button>
    );
  };

  return (
    <div className="container-fluid py-5 d-flex flex-column align-items-center min-vh-100">
      <h1 className="display-4 fw-bold mb-5 neon-text-primary text-center">
        NEON TAC TOE
      </h1>

      {view === 'menu' ? (
        <div className="glass-panel text-center fade-in col-12 col-md-8 col-lg-5">
          <h3 className="mb-4 text-light">Game Setup</h3>
          
          <div className="mb-4">
            <p className="mb-2 fw-semibold text-uppercase opacity-75">Game Mode</p>
            <div className="btn-group w-100" role="group">
              <button 
                className={`btn btn-neon ${mode === 'single' ? 'active' : ''}`} 
                onClick={() => setMode('single')}>1 Player (AI)</button>
              <button 
                className={`btn btn-neon ${mode === 'multi' ? 'active' : ''}`} 
                onClick={() => setMode('multi')}>2 Players</button>
            </div>
          </div>

          <div className="mb-4">
            <p className="mb-2 fw-semibold text-uppercase opacity-75">Your Marker</p>
            <div className="btn-group w-100" role="group">
              <button 
                className={`btn btn-neon ${player1Marker === 'X' ? 'active' : ''}`} 
                onClick={() => setPlayer1Marker('X')}>Play as X</button>
              <button 
                className={`btn btn-neon ${player1Marker === 'O' ? 'active' : ''}`} 
                onClick={() => setPlayer1Marker('O')}>Play as O</button>
            </div>
          </div>

          <div className="mb-5">
            <p className="mb-2 fw-semibold text-uppercase opacity-75">Who goes first?</p>
            <div className="btn-group w-100" role="group">
              <button 
                className={`btn btn-neon ${firstToMove === 'X' ? 'active' : ''}`} 
                onClick={() => setFirstToMove('X')}>X First</button>
              <button 
                className={`btn btn-neon ${firstToMove === 'O' ? 'active' : ''}`} 
                onClick={() => setFirstToMove('O')}>O First</button>
            </div>
          </div>

          <button className="btn btn-neon w-100 fs-5 py-3" onClick={startGame}>
            START GAME
          </button>
        </div>
      ) : (
        <div className="glass-panel text-center fade-in col-12 col-md-10 col-lg-6">
          {/* Status Header */}
          <div className="mb-4">
            {winner ? (
              <h2 className="fw-bold mb-0 fade-in">
                {winner === 'Draw' ? (
                  <span className="text-warning">IT'S A DRAW!</span>
                ) : (
                  <span className={winner === 'X' ? 'neon-text-x' : 'neon-text-o'}>
                    PLAYER {winner} WINS!
                  </span>
                )}
              </h2>
            ) : (
              <h3 className="fw-bold mb-0">
                Turn: <span className={xIsNext ? 'neon-text-x' : 'neon-text-o'}>{xIsNext ? 'X' : 'O'}</span>
                {isAITurn && <span className="fs-6 ms-2 text-muted">(AI Thinking...)</span>}
              </h3>
            )}
          </div>

          {/* Score Board */}
          <div className="d-flex justify-content-between mb-4">
            <div className="score-card">
              <div className="score-title">Player X {mode === 'single' && player1Marker === 'X' ? '(You)' : ''}</div>
              <div className="score-value neon-text-x">{scores.X}</div>
            </div>
            <div className="score-card">
              <div className="score-title">Draws</div>
              <div className="score-value text-warning">{scores.Draws}</div>
            </div>
            <div className="score-card">
              <div className="score-title">Player O {mode === 'single' && player1Marker === 'O' ? '(You)' : ''}</div>
              <div className="score-value neon-text-o">{scores.O}</div>
            </div>
          </div>

          {/* Game Board Grid */}
          <div className="board-grid mb-4">
            {[...Array(9)].map((_, i) => renderSquare(i))}
          </div>

          {/* Controls */}
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-neon" onClick={resetGame}>
              {winner ? 'REMATCH' : 'RESTART'}
            </button>
            <button className="btn btn-outline-light rounded-pill px-4" onClick={quitToMenu}>
              MAIN MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
}