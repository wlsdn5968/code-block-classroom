"use client";
// 챕터 '만든 다음에 터지는 것들' · 레슨 '먼저 메모리'의 시뮬레이션.
// 운영 기록의 실측값(서버 958MB, 봇 425MB일 때 여유 210MB, 스왑 2,047MB 중 596MB 사용, 테스트 작업 약 190MB)을 기준으로 한 단순 계산이다.
import { useState } from "react";
import { LabBox } from "../labs/LabBox";

const TOTAL = 958;
const BOT_AT_MEASURE = 425;
const AVAILABLE_AT_MEASURE = 210;
const OTHER = TOTAL - BOT_AT_MEASURE - AVAILABLE_AT_MEASURE; // 운영체제·캐시 등 (958 - 425 - 210)
const SWAP_TOTAL = 2047;
const SWAP_USED = 596;
const TEST_JOB = 190;

export function MemorySim() {
  const [bot, setBot] = useState(BOT_AT_MEASURE);
  const [test, setTest] = useState(false);
  const free = AVAILABLE_AT_MEASURE - (bot - BOT_AT_MEASURE) - (test ? TEST_JOB : 0);
  const short = Math.max(0, -free);
  const swapLeft = SWAP_TOTAL - SWAP_USED; // 기록상 남은 스왑 1,451MB. 이 범위(봇 최대 800MB)에서는 다 쓰지 않는다
  // 쓰려는 양이 958MB를 넘으면 막대 전체를 그 합으로 줄여 모든 칸이 보이게 한다
  const used = OTHER + bot + (test ? TEST_JOB : 0);
  const scale = Math.max(TOTAL, used);
  const pct = (mb: number) => `${Math.max(0, (mb / scale) * 100)}%`;
  const state = free >= 0 ? "ok" : "swap";
  return (
    <LabBox title="메모리가 모자라면">
      <p>봇 메모리를 늘리거나 같은 서버에서 테스트 작업을 돌려 보세요. 막대는 서버 메모리 958MB예요.</p>
      <div className="ctrl">
        <label htmlFor="memsim-bot">봇 메모리</label>
        <input id="memsim-bot" type="range" min={250} max={800} step={5} value={bot} onChange={(e) => setBot(Number(e.currentTarget.value))} />
        <b>{bot}MB</b>
      </div>
      <div className="ctrl">
        <span>같은 서버에서 테스트 작업(약 190MB):</span>
        <button className={`tog ${test ? "on" : ""}`} onClick={() => setTest(true)}>
          켬
        </button>
        <button className={`tog ${!test ? "on" : ""}`} onClick={() => setTest(false)}>
          끔
        </button>
      </div>
      <div className={`membar ${used > TOTAL ? "over" : ""}`} role="img" aria-label={`서버 메모리 958MB 중 그 외 ${OTHER}MB, 봇 ${bot}MB, 테스트 ${test ? TEST_JOB : 0}MB, 여유 ${Math.max(0, free)}MB`}>
        <span className="seg other" style={{ width: pct(OTHER) }}>
          그 외 {OTHER}
        </span>
        <span className="seg bot" style={{ width: pct(bot) }}>
          봇 {bot}
        </span>
        {test && (
          <span className="seg test" style={{ width: pct(TEST_JOB) }}>
            테스트 {TEST_JOB}
          </span>
        )}
        {free > 0 && <span className="seg free" style={{ width: pct(free) }}>여유 {free}</span>}
      </div>
      {used > TOTAL && <p className="lead">쓰려는 양 {used}MB가 서버 메모리 958MB를 넘었어요(막대를 줄여서 보여 줘요).</p>}
      {state === "ok" && <div className="out ok">지금 계산으로는 여유 메모리 {free}MB가 남아요.</div>}
      {state === "swap" && (
        <div className="out no">
          <b>{short}MB가 모자라요.</b> 모자란 만큼 느린 디스크의 스왑으로 밀려나 봇이 느려져요. 남은 스왑은 {swapLeft.toLocaleString()}MB예요. 스왑마저 모자라면 커널이 작업 하나를 골라 강제로 끝내요(OOM).
        </div>
      )}
      <p className="lead">운영 기록(봇 425MB일 때 여유 210MB)을 기준으로 한 단순 계산이에요. 실제 서버는 캐시를 돌려받는 등 더 복잡하게 움직여요.</p>
    </LabBox>
  );
}
