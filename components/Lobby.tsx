import { dealCards, shuffle } from "@/utils";
import db from "../firebase/firebase.config";
import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { User } from "interface";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store";
import { setParticipants } from "store/slices/roomSlice";
import { useEffect } from "react";
import styles from "../src/styles/Lobby.module.css";
import { Roles } from "../src/roles";

function canStartGame(numberOfParticipants: number): boolean {
  return numberOfParticipants >= 4 && numberOfParticipants <= 6;
}

async function handleClick(roomCode: string, participants: User[]) {
  // Lobby 삭제
  await deleteDoc(doc(db, "rooms", roomCode));
  // Game 생성
  const roles = {
    4: [
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.SKELETON,
      Roles.SKELETON,
    ],
    5: [
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.SKELETON,
      Roles.SKELETON,
    ],
    6: [
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.SKELETON,
      Roles.SKELETON,
    ],
  };
  const shuffledRoles = shuffle(roles[participants.length as 4 | 5 | 6]);
  const dealtCards = dealCards(Object.keys(participants).length, {
    empty: 0,
    treasure: 0,
  });
  let players: { [userId: string]: Object } = {};
  participants.forEach((participant, index) => {
    players[participant.userId] = {
      ...participant,
      role: shuffledRoles[index],
      hands: dealtCards.splice(0, 5),
    };
  });
  await setDoc(doc(db, "games", roomCode), {
    players,
    revealedCards: {
      empty: 0,
      treasure: 0,
    },
    currentRound: {
      openedCards: 0,
      currentTurnPlayerId:
        participants[
          Math.floor(Math.random() * Object.keys(participants).length)
        ].userId,
      roundNumber: 1,
    },
  });
}

export default function Lobby({
  roomCode,
  participants,
}: {
  roomCode: string;
  participants: User[];
}) {
  const dispatch = useDispatch();
  const { nickname, userId } = useSelector((state: RootState) => state.user);
  const docRef = doc(db, "rooms", roomCode);
  useEffect(() => {
    const unSub = onSnapshot(docRef, (doc) => {
      const currentData = doc.data();
      if (!currentData) return;
      if (
        JSON.stringify(currentData.participants) !==
        JSON.stringify(participants)
      )
        dispatch(setParticipants(currentData.participants));
    });

    window.addEventListener("beforeunload", async () => {
      const docRef = doc(db, "rooms", roomCode);
      const data = await getDoc(docRef);
      if (data.exists()) {
        await updateDoc(docRef, {
          participants: data
            .data()
            .participants.filter(
              (participant: User) => participant.userId !== userId
            ),
        });
      }
    });
  }, []);
  return (
    <>
      <div className={styles.main + " " + "container"}>
        <h1>입장 코드: {roomCode}</h1>
        <h2>
          내 닉네임: {nickname}, 참가자:{" "}
          {Object.values(participants)
            .map((participant) => participant.nickname)
            .join(", ")}
        </h2>
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/ckd5Au7lryE?start=12"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!canStartGame(Object.keys(participants).length)}
          onClick={async () => await handleClick(roomCode, participants)}
        >
          게임 시작
        </button>
        {!canStartGame(Object.keys(participants).length) && (
          <p>게임을 시작하기 위해서는 최소 4명, 최대 6명이 필요합니다.</p>
        )}
      </div>
    </>
  );
}
