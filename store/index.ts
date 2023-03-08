import { combineReducers, configureStore } from "@reduxjs/toolkit";
import roomReducer from "./slices/roomSlice";
import userReducer from "./slices/userSlice";
import gameReducer from "./slices/gameSlice";

const reducer = combineReducers({
  room: roomReducer,
  user: userReducer,
  game: gameReducer,
});

const store = configureStore({
  reducer,
});

export default store;

export type RootState = ReturnType<typeof reducer>;
