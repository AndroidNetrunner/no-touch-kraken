import { createSlice } from "@reduxjs/toolkit";
import { Game } from "interface";

const initialState: Game = {
  players: {},
  revealedCards: {
    empty: 0,
    treasure: 0,
    total: 0,
  },
  currentRound: {
    openedCards: 0,
    currentTurnPlayerId: "",
    roundNumber: 1,
  },
  description: "",
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setPlayers(state, { payload }) {
      if (JSON.stringify(state.players) !== JSON.stringify(payload))
        state.players = { ...payload };
    },
    setRevealedCards(state, { payload }) {
      if (
        JSON.stringify(state.revealedCards) !== JSON.stringify(payload.players)
      )
        state.revealedCards = payload;
    },
    setCurrentTurnPlayerId: (state, { payload }) => {
      state.currentRound.currentTurnPlayerId = payload;
    },
    setCurrentRound: (state, { payload }) => {
      state.currentRound.openedCards = payload.openedCards;
      state.currentRound.currentTurnPlayerId = payload.currentTurnPlayerId;
      state.currentRound.roundNumber = payload.roundNumber;
    },
    setDescription: (state, { payload }) => {
      state.description = payload;
    },
  },
});

export const {
  setPlayers,
  setRevealedCards,
  setCurrentTurnPlayerId,
  setCurrentRound,
  setDescription,
} = gameSlice.actions;

export default gameSlice.reducer;
