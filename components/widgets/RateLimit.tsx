"use client";
// 레슨 '눈에 안 보이는 한도'의 계산: 1분에 60번까지 받는 예시 서비스에 요청을 보내면 몇 번이 429로 거절되는지.
// 한도 60번과 1분 단위로 끊는 방식은 설명용 단순화다(서비스마다 다르다).
import { useEffect, useState } from "react";
import { gameEvent } from "@/lib/store";
import { LabBox } from "../labs/LabBox";

const LIMIT = 60;

export function RateLimit() {
  const [n, setN] = useState(40);
  // 배지 "한도 측정가": 거절이 0번인 최대 요청 수(= 한도)를 찾음
  useEffect(() => {
    if (n === LIMIT) gameEvent("rate-max");
  }, [n]);
  const ok = Math.min(n, LIMIT);
  const rej = Math.max(0, n - LIMIT);
  return (
    <LabBox title="1분에 몇 번까지?">
      <p>예시 서비스는 1분에 {LIMIT}번까지만 받아요. 1분에 보내는 요청 수를 바꿔 보세요.</p>
      <div className="ctrl">
        <label htmlFor="rate-n">1분에 보내는 요청</label>
        <input id="rate-n" type="range" min={10} max={200} step={1} value={n} onChange={(e) => setN(Number(e.currentTarget.value))} />
        <b>{n}번</b>
      </div>
      <div className="cmpbars">
        <span>처리됨</span>
        <span className="track">
          <span className="fill fast" style={{ width: `${(ok / n) * 100}%` }}></span>
        </span>
        <b>{ok}번</b>
        <span>429 거절</span>
        <span className="track">
          <span className="fill slow" style={{ width: `${(rej / n) * 100}%` }}></span>
        </span>
        <b>{rej}번</b>
      </div>
      {rej > 0 ? (
        <div className="out no">
          1분에 <b>{rej}번</b>이 429로 거절돼요. 코드는 그대로인데 요청이 늘었을 뿐이에요.
        </div>
      ) : (
        <div className="out ok">
          한도 안이에요. 1분에 <b>{LIMIT - n}번</b> 더 보낼 수 있어요.
        </div>
      )}
      <p className="lead">한도 {LIMIT}번과 1분 단위로 끊는 방식은 설명용 예시예요. 실제 한도와 세는 방식은 서비스마다 달라요. 1분 한도를 더 짧게 나눠 적용하는 서비스도 있어서, 짧은 순간에 몰아 보내면 {LIMIT}번 안이라도 거절될 수 있어요(아래 Claude API 예).</p>
    </LabBox>
  );
}
