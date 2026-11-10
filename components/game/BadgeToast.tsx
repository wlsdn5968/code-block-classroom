// 배지를 새로 얻으면 화면 아래에 잠깐 띄운다 (기획서 v2 M1). 진도를 다 읽기 전의 상태는 기준으로 삼지 않는다
import { useEffect, useRef, useState } from "react";
import { BADGES, hasBadge } from "@/lib/game";
import { go, isLoaded, read } from "@/lib/store";

export function BadgeToast() {
  const r = read();
  const ids = isLoaded() ? BADGES.filter((b) => hasBadge(b, r)).map((b) => b.id) : null;
  // 진도를 읽기 전(null)과 배지 0개([])를 구분해야, 처음 방문한 사람의 첫 배지도 알림이 뜬다
  const key = ids ? `읽음:${ids.join(",")}` : "";
  const prev = useRef<Set<string> | null>(null);
  const [shown, setShown] = useState<string[] | null>(null);
  useEffect(() => {
    if (!ids) return;
    if (prev.current === null) {
      prev.current = new Set(ids);
      return;
    }
    const fresh = ids.filter((id) => !prev.current!.has(id));
    prev.current = new Set(ids);
    if (fresh.length) setShown(fresh);
    // ids는 key가 같으면 같은 목록이다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => setShown(null), 4000);
    return () => clearTimeout(t);
  }, [shown]);
  const list = (shown ?? []).map((id) => BADGES.find((x) => x.id === id)!).filter(Boolean);
  return (
    <div className="toast" data-new="game" role="status" aria-live="polite">
      {list.length > 0 && (
        <button onClick={() => go("me")}>
          <span aria-hidden="true">{list[0].ico}</span> 배지 획득: <b>{list[0].name}</b>
          {list.length > 1 ? ` 외 ${list.length - 1}개` : ""} · 내 기록 보기
        </button>
      )}
    </div>
  );
}
