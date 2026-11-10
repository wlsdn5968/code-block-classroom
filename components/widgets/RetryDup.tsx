"use client";
// 레슨 '되돌릴 수 없는 행동'의 흉내: 게시 요청의 응답을 못 받아 다시 보낼 때, 멱등성 키가 있으면 한 번만 처리된다.
// 서버는 요청마다 처리하고, 같은 키가 다시 오면 처음 결과를 돌려주는 것으로 단순화했다.
import { useEffect, useState } from "react";
import { gameEvent } from "@/lib/store";
import { Quest } from "../game/Quest";
import { LabBox } from "../labs/LabBox";

export function RetryDup() {
  const [key, setKey] = useState(false);
  const [tries, setTries] = useState(1);
  // 배지 "한 번만": 멱등성 키로 여러 번 보내도 게시물 1개
  useEffect(() => {
    if (key && tries >= 2) gameEvent("retry-key");
  }, [key, tries]);
  const posts = key ? 1 : tries;
  const reset = (k: boolean) => {
    setKey(k);
    setTries(1);
  };
  return (
    <LabBox title="응답을 못 받았을 때 다시 보내기">
      <p>게시 요청을 보냈는데 응답이 오기 전에 연결이 끊겼어요. 서버는 첫 요청을 이미 처리했어요. 다시 보내 보세요.</p>
      <Quest id="retry" met={key && tries >= 3} />
      <div className="ctrl">
        <span>멱등성 키</span>
        <button className={`tog ${!key ? "on" : ""}`} onClick={() => reset(false)}>
          없음
        </button>
        <button className={`tog ${key ? "on" : ""}`} onClick={() => reset(true)}>
          있음
        </button>
      </div>
      <div className="ctrl">
        <button className="tog" onClick={() => setTries((t) => Math.min(t + 1, 9))}>
          같은 요청 다시 보내기
        </button>
        <span>보낸 횟수 {tries}번</span>
      </div>
      <div className={`out ${posts > 1 ? "no" : "ok"}`} data-k="posts">
        서버에 생긴 게시물 <b>{posts}개</b>
        {key ? (tries > 1 ? " — 같은 키라서 처음 결과를 돌려줬어요." : "") : posts > 1 ? " — 같은 글이 여러 번 올라갔어요." : ""}
      </div>
      <p className="lead">서버가 같은 키를 기억해 처음 결과를 돌려주는 것으로 단순화했어요. 멱등성 키는 서비스가 지원할 때만 효과가 있고(예: Stripe), 키를 얼마나 오래 기억하는지도 서비스마다 달라요.</p>
    </LabBox>
  );
}
