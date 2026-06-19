import { useState, useEffect, useCallback } from 'react';
import { calculateWinner, isBoardFull, getBestMove } from '../utils/ai';

export const useGameState = () => {
  const [gameMode, setGameMode] = useState(null); 
  const [playerMarker, setPlayerMarker] = useState('X'); 
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const { winner, line: winningLine } = calculateWinner(board);
  const draw = !winner && isBoardFull(board);
  const currentPlayer = isXNext ? 'X' : 'O';
  const aiMarker = playerMarker === 'X' ? 'O' : 'X';
  const isAITurn = gameMode === 'single' && currentPlayer === aiMarker && !winner && !draw;

  const play = useCallback((index) => {
    if (board[index] || winner || isAITurn) return;
    setBoard((prev) => {
      const newBoard = [...prev];
      newBoard[index] = currentPlayer;
      return newBoard;
    });
    setIsXNext(!isXNext);
  }, [board, winner, isAITurn, currentPlayer, isXNext]);

  useEffect(() => {
    if (isAITurn) {
      const timer = setTimeout(() => {
        const move = getBestMove([...board], aiMarker, playerMarker);
        if (move !== -1) {
          setBoard((prev) => {
            const newBoard = [...prev];
            newBoard[move] = aiMarker;
            return newBoard;
          });
          setIsXNext(!isXNext);
        }
      }, 600); // Artificial delay for realism
      return () => clearTimeout(timer);
    }
  }, [isAITurn, board, aiMarker, playerMarker, isXNext]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const changeMode = () => {
    setGameMode(null);
    resetGame();
  };

  return {
    gameMode, setGameMode,
    playerMarker, setPlayerMarker,
    board, isXNext, currentPlayer,
    winner, winningLine, draw, isAITurn, aiMarker,
    play, resetGame, changeMode
  };
};