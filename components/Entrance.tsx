import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import db from "../firebase/firebase.config";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useDispatch } from "react-redux";
import store from "store";
import { setRoomCode } from "store/slices/roomSlice";
import { createUser } from "store/slices/userSlice";
import styles from "../src/styles/Entrance.module.css";

export default function Entrance() {
  const [username, setUsername] = useState("");
  const [entryCode, setEntryCode] = useState("");
  const dispatch = useDispatch();

  return (
    <main className={styles.main}>
      <h1 className={styles.welcome}>
        노 터치 크라켄 온라인에 오신 것을 환영합니다!
      </h1>
      <div className="container">
        <div className="row">
          <div className="col-sm">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/ckd5Au7lryE?start=12"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            ></iframe>
          </div>
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

function createRoomCode(length: number) {
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += alphabets[Math.floor(Math.random() * 26)];
  }
  return result;
}

async function handleCreate(nickname: string, dispatch: Dispatch<AnyAction>) {
  const roomCode = createRoomCode(7);
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
