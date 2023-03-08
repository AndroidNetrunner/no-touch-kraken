"use client";

import { useDispatch, useSelector } from "react-redux";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import db from "../../firebase/firebase.config";
import {
  arrayUnion,
  collection,
  CollectionReference,
  doc,
  DocumentData,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useRouter, NextRouter } from "next/router";
import { setRoomCode } from "store/slices/roomSlice";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { createUser } from "store/slices/userSlice";
import store, { RootState } from "store";
import Room from "components/Room";

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
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const code = useSelector((state: RootState) => state.room.roomCode);
  const dispatch = useDispatch();
  return code ? (
    <Room />
  ) : (
    <main className={styles.main}>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <h1>노 터치 크라켄 온라인에 오신 것을 환영합니다!</h1>
      <form>
        <div className="mb-3">
          <label htmlFor="nicknameInput" className="form-label">
            닉네임(필수)
          </label>
          <input
            type="text"
            className="form-control"
            id="nickNameInput"
            onChange={(e) => setNickname(e.target.value)}
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
            onChange={(e) => setRoomCode(e.target.value)}
            maxLength={7}
          />
        </div>
        <div id="enterCodeDescription" className="form-text">
          방 생성 시에는 입장 코드를 입력하지 말아주세요.
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!nickname || !!roomCode}
          onClick={(e) => {
            e.preventDefault();
            handleCreate(nickname, dispatch);
          }}
        >
          방 생성
        </button>
        <button
          type="submit"
          className="btn btn-success"
          disabled={!nickname || !/^[A-Z]{7}$/.test(roomCode)}
          onClick={(e) => {
            e.preventDefault();
            handleJoin(roomCode, nickname, dispatch);
          }}
        >
          방 입장
        </button>
      </form>
    </main>
  );
}
