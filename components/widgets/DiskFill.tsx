"use client";
// 레슨 '쌓이기만 하는 기록'의 계산기: 지금 사용률과 하루 증가량으로 디스크가 가득 차는 날을 계산한다.
// 기본값(사용률 72%, 하루 100MB)은 운영 기록, 디스크 크기는 예시다.
import { useState } from "react";
import { LabBox } from "../labs/LabBox";

export function DiskFill() {
  const [disk, setDisk] = useState(30);
  const [used, setUsed] = useState(72);
  const [grow, setGrow] = useState(100);
  const leftGb = disk * (1 - used / 100);
  const days = Math.floor((leftGb * 1000) / grow);
  return (
    <LabBox title="디스크가 가득 차는 날">
      <p>지금 사용률과 하루에 늘어나는 양을 바꿔 보세요.</p>
      <div className="ctrl">
        <label htmlFor="disk-gb">디스크 크기(예시)</label>
        <input id="disk-gb" type="range" min={10} max={200} step={5} value={disk} onChange={(e) => setDisk(Number(e.currentTarget.value))} />
        <b>{disk}GB</b>
      </div>
      <div className="ctrl">
        <label htmlFor="disk-used">지금 사용률</label>
        <input id="disk-used" type="range" min={10} max={99} step={1} value={used} onChange={(e) => setUsed(Number(e.currentTarget.value))} />
        <b>{used}%</b>
      </div>
      <div className="ctrl">
        <label htmlFor="disk-grow">하루에 늘어나는 양</label>
        <input id="disk-grow" type="range" min={10} max={3000} step={10} value={grow} onChange={(e) => setGrow(Number(e.currentTarget.value))} />
        <b>{grow >= 1000 ? `${(grow / 1000).toFixed(1)}GB` : `${grow}MB`}</b>
      </div>
      <div className="diskbar" role="img" aria-label={`디스크 ${disk}GB 중 ${used}% 사용`}>
        <span className={`fill ${used >= 85 ? "hot" : ""}`} style={{ width: `${used}%` }}></span>
      </div>
      <div className={`out ${days < 30 ? "no" : "nt"}`}>
        남은 공간 <b>{leftGb.toFixed(1)}GB</b>, 이 속도면 약 <b>{days.toLocaleString()}일</b> 뒤 가득 차요.
      </div>
      <p className="lead">사용률 72%와 하루 100MB는 운영 기록이에요. 디스크 크기는 예시라서 실제 서버의 크기를 넣어 보세요.</p>
    </LabBox>
  );
}
