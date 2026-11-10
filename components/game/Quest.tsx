"use client";
// 실험실 목표 (기획서 v2 4-4): 화면 부품마다 목표 한 줄을 보여 주고, 조건이 맞으면 한 번만 기록한다(경험치 10).
// 조건은 각 부품이 자기 계산식으로 판정해 met으로 넘긴다
import { useEffect } from "react";
import { QUESTS } from "@/lib/game";
import { GAME_QUESTS, questDone, read } from "@/lib/store";

export function Quest({ id, met }: { id: (typeof GAME_QUESTS)[number]; met: boolean }) {
  const done = !!read().game.quest[id];
  useEffect(() => {
    if (met) questDone(id);
  }, [id, met]);
  return (
    <p className={`quest ${done ? "done" : ""}`} data-quest={id}>
      <span aria-hidden="true">🎯</span> 목표: {QUESTS[id]}
      {done && <b> ✓ 달성 · +10 XP</b>}
    </p>
  );
}
