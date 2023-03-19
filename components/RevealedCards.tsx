export default function RevealedCards({
  revealedCards: { treasure, empty },
}: {
  revealedCards: { treasure: number; empty: number };
}) {
  return (
    <>
      <h1>현재 등장한 카드</h1>
      <span>
        보물상자: {treasure} 빈 상자: {empty}
      </span>
    </>
  );
}
