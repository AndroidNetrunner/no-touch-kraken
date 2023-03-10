import { createSlice } from "@reduxjs/toolkit";
import { User } from "interface";

function createUserId() {
  const alphabets =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < 10; i++)
    result += alphabets[Math.floor(Math.random() * 62)];
  return result;
}

const initialState: User = {
  nickname: "",
  userId: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    createUser: (state, { payload }) => {
      state.nickname = payload;
      state.userId = createUserId();
    },
    setUserId: (state, { payload }) => {
      state.userId = payload;
    },
    setNickname: (state, { payload }) => {
      state.nickname = payload;
    },
  },
});

export const { createUser, setUserId, setNickname } = userSlice.actions;

export default userSlice.reducer;
