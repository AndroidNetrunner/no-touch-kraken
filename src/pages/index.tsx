"use client";

import { useDispatch, useSelector } from "react-redux";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import db from "../../firebase/firebase.config";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { setRoomCode } from "store/slices/roomSlice";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { createUser, setNickname, setUserId } from "store/slices/userSlice";
import store, { RootState } from "store";
import Room from "components/Room";
import Cookies from "js-cookie";
import {
  setCurrentRound,
  setPlayers,
  setRevealedCards,
} from "store/slices/gameSlice";

async function handleCreate(nickname: string, dispatch: Dispatch<AnyAction>) {
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 7; i++) {
    result += alphabets[Math.floor(Math.random() * 26)];
  }
  const roomCode = result;
  dispatch(setRoomCode(roomCode));
  dispatch(createUser(nickname));
  const currentUser = store.getState().user;
  await setDoc(doc(db, "rooms", roomCode), {
    admin: currentUser,
    participants: [currentUser],
  });
}
async function syncStoreWithFirebase(
  {
    roomCode,
    nickname,
    userId,
  }: {
    roomCode: string | undefined;
    nickname: string | undefined;
    userId: string | undefined;
  },
  dispatch: Dispatch<AnyAction>
) {
  if (!roomCode || !nickname || !userId) return;
  const data = (await getDoc(doc(db, "games", roomCode))).data();
  if (data) {
    dispatch(setRoomCode(roomCode));
    dispatch(setNickname(nickname));
    dispatch(setUserId(userId));
    dispatch(setPlayers(data.players));
    dispatch(setRevealedCards(data.revealedCards));
    dispatch(setCurrentRound(data.currentRound));
  }
}

async function handleJoin(
  roomCode: string,
  nickname: string,
  dispatch: Dispatch<AnyAction>
) {
  const docRef = doc(db, "rooms", roomCode);
  const roomSnap = await getDoc(docRef);
  if (!roomSnap.exists()) alert("해당하는 방이 존재하지 않습니다.");
  else {
    dispatch(setRoomCode(roomCode));
    dispatch(createUser(nickname));
    const currentUser = store.getState().user;
    await updateDoc(docRef, { participants: arrayUnion(currentUser) });
  }
}
export default function Home() {
  const [username, setUsername] = useState("");
  const [entryCode, setEntryCode] = useState("");
  const code = useSelector((state: RootState) => state.room.roomCode);
  const dispatch = useDispatch();
  useEffect(() => {
    const { roomCode, nickname, userId } = Cookies.get();
    if (!roomCode || !nickname || !userId) return;
    syncStoreWithFirebase({ roomCode, nickname, userId }, dispatch);
  }, []);
  return code ? (
    <Room />
  ) : (
    <main className={styles.main}>
      {/* <meta name="viewport" content="width=device-width, initial-scale=1" /> */}
      <h1 className={styles.welcome}>
        노 터치 크라켄 온라인에 오신 것을 환영합니다!
      </h1>
      <div className="container">
        <div className="row">
          <div className="col-sm"></div>
          <div className="col-sm">
            <form>
              <div className="mb-3">
                <label htmlFor="nicknameInput" className="form-label">
                  닉네임(필수)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nickNameInput"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="roomCodeInput" className="form-label">
                  입장 코드
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="roomCodeInput"
                  onChange={(e) => setEntryCode(e.target.value)}
                  maxLength={7}
                />
              </div>
              <div id="enterCodeDescription" className="form-text">
                방 생성 시에는 입장 코드를 입력하지 말아주세요.
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!username || !!entryCode}
                onClick={(e) => {
                  e.preventDefault();
                  handleCreate(username, dispatch);
                }}
              >
                방 생성
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={!username || !/^[A-Z]{7}$/.test(entryCode)}
                onClick={(e) => {
                  e.preventDefault();
                  handleJoin(entryCode, username, dispatch);
                }}
              >
                방 입장
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
