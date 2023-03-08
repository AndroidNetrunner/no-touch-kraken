import { Player } from "interface";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setDescription } from "store/slices/gameSlice";

export default function Result({
  players,
  description,
}: {
  players: { [userId: string]: Player };
  description: string;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
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
          router.push({
            pathname: "/",
          });
        }}
        className="btn btn-success"
      >
        처음으로 돌아가기
      </button>
    </>
  );
}
