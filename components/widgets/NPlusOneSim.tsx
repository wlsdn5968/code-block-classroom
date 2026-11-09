"use client";
// 레슨 'DB가 느려지는 이유'의 시뮬레이션: 종목마다 따로 묻기 vs 묶어서 묻기.
// 운영 기록의 실측(47종목, 따로 묻기 약 329번·11.7초, 묶기 7번·1.1초)으로 1회 요청 시간을 역산한 단순 계산이다.
import { useState } from "react";
import { LabBox } from "../labs/LabBox";

const BASE_N = 47;
const PER_ITEM = 329 / BASE_N; // 종목 1개당 따로 묻는 횟수 (= 7)
const SEPARATE_MS = 11700 / 329; // 따로 묻기 1번 평균 (약 35.6ms)
const BATCH_CALLS = 7;
const BATCH_MS = 1100; // 묶어서 7번 묻는 데 걸린 시간 (종목 수와 무관하다고 단순화)

export function NPlusOneSim() {
  const [n, setN] = useState(BASE_N);
  const calls = Math.round(n * PER_ITEM);
  const sepSec = (calls * SEPARATE_MS) / 1000;
  const batchSec = BATCH_MS / 1000;
  const max = Math.max(sepSec, batchSec);
  return (
    <LabBox title="따로 묻기 vs 묶어서 묻기">
      <p>종목 수를 바꿔 보세요. 따로 물으면 종목이 늘수록 요청과 시간이 같이 늘어요.</p>
      <div className="ctrl">
        <label htmlFor="nplus-n">종목 수</label>
        <input id="nplus-n" type="range" min={5} max={300} step={1} value={n} onChange={(e) => setN(Number(e.currentTarget.value))} />
        <b>{n}개</b>
      </div>
      <div className="cmpbars">
        <span>따로 묻기 {calls.toLocaleString()}번</span>
        <span className="track">
          <span className="fill slow" style={{ width: `${(sepSec / max) * 100}%` }}></span>
        </span>
        <b>{sepSec.toFixed(1)}초</b>
        <span>묶어서 {BATCH_CALLS}번</span>
        <span className="track">
          <span className="fill fast" style={{ width: `${(batchSec / max) * 100}%` }}></span>
        </span>
        <b>{batchSec.toFixed(1)}초</b>
      </div>
      <div className={`out ${sepSec > batchSec ? "no" : "ok"}`}>
        따로 물으면 묶어서 물을 때보다 약 <b>{(sepSec / batchSec).toFixed(1)}배</b> 걸려요.
      </div>
      <p className="lead">운영 기록(47종목: 따로 329번 11.7초, 묶어서 7번 1.1초)으로 1회 요청 시간을 나눠 계산한 단순 계산이에요. 묶어서 묻는 시간은 종목 수가 바뀌어도 1.1초 그대로라고 가정했어요. 실제 시간은 네트워크와 데이터 양에 따라 달라요.</p>
    </LabBox>
  );
}
