"use client";
// 레슨 '요금 폭탄'의 계산: 코드가 몇 초마다 한 번 도는지에 따라 30일 동안 부르는 횟수와 요금.
// 1번에 10원과 30일은 설명용 예시다.
import { useState } from "react";
import { LabBox } from "../labs/LabBox";

const STEPS = [1, 5, 10, 30, 60, 300, 600, 3600];
const PER_CALL = 10;
const MONTH_SEC = 30 * 24 * 60 * 60;
const label = (s: number) => (s < 60 ? `${s}초` : s < 3600 ? `${s / 60}분` : `${s / 3600}시간`);

export function LoopCost() {
  const [i, setI] = useState(4);
  const sec = STEPS[i];
  const calls = MONTH_SEC / sec;
  const won = calls * PER_CALL;
  return (
    <LabBox title="몇 초마다 부르나요?">
      <p>유료 서비스를 1번 부를 때 10원(예시)이 든다고 해요. 코드가 몇 초마다 한 번 부르는지 바꿔 보세요.</p>
      <div className="ctrl">
        <label htmlFor="loop-step">부르는 간격</label>
        <input id="loop-step" type="range" min={0} max={STEPS.length - 1} step={1} value={i} onChange={(e) => setI(Number(e.currentTarget.value))} />
        <b>{label(sec)}마다</b>
      </div>
      <div className={`out ${won >= 1000000 ? "no" : won >= 100000 ? "nt" : "ok"}`}>
        30일 동안 <b>{calls.toLocaleString()}번</b>, 약 <b>{won.toLocaleString()}원</b>이에요.
      </div>
      <p className="lead">1번에 10원과 30일은 설명용 예시예요. 1시간마다 부르면 720번이지만, 1초마다 부르면 그 3,600배인 2,592,000번이 돼요.</p>
    </LabBox>
  );
}
