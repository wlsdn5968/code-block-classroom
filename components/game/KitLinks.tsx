// "내 가방" 바로가기 (기획서 v2 M2): 복습함, 안전 수칙 카드, 질문 꾸러미
import { go } from "@/lib/store";

export function KitLinks({ left }: { left: number }) {
  return (
    <div className="kit" data-new="game">
      <button className="btn sm alt" onClick={() => go("review")}>
        🔁 복습함{left ? ` ${left}` : ""}
      </button>
      <button className="btn sm alt" onClick={() => go("card")}>
        🪪 수칙 카드
      </button>
      <button className="btn sm alt" onClick={() => go("ask")}>
        💬 질문 꾸러미
      </button>
    </div>
  );
}
