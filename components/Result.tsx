import db from "../firebase/firebase.config";
// import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { Player } from "interface";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setDescription } from "store/slices/gameSlice";
import { setRoomCode } from "store/slices/roomSlice";
import { RoomCode } from "@/utils";
import { ref, remove, set } from "firebase/database";

export default function Result({
  players,
  description,
  roomCode,
}: {
  players: { [userId: string]: Player };
  description: string;
  roomCode: RoomCode;
}) {
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      await remove(ref(db, "games/" + roomCode));
      await set(ref(db, "results/" + roomCode), {
        players: Object.values(players).map((player) => {
          return { nickname: player.nickname, role: player.role };
        }),
      });
    })();
  }, [players, roomCode]);
  return (
    <>
      <h1>게임이 종료되었습니다!</h1>
      <h2>{description}</h2>
      <p>각 플레이어의 역할은 다음과 같습니다.</p>
      <tbody>
        {Object.values(players).map((player) => (
          <p key={player.userId}>
            {player.nickname}: {player.role}{" "}
          </p>
        ))}
      </tbody>
      <button
        onClick={() => {
          dispatch(setDescription(""));
          dispatch(setRoomCode(""));
        }}
        className="btn btn-success"
      >
        처음으로 돌아가기
      </button>
    </>
  );
}
