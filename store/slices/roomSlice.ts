import { createSlice } from "@reduxjs/toolkit";
import { Lobby } from "interface";

const initialState: Lobby = {
  roomCode: "",
  participants: [],
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoomCode(state, { payload }) {
      state.roomCode = payload;
    },
    setParticipants(state, { payload }) {
      state.participants = payload;
    },
  },
});

export const { setRoomCode, setParticipants } = roomSlice.actions;

export default roomSlice.reducer;
