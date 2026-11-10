"use client";
// 코드 블록 교실 전체 화면. 프로토타입 v4와 같은 화면 구조·동작을 React로 옮긴 것.
import { useEffect, useSyncExternalStore } from "react";
import { levelOf, xpOf } from "@/lib/game";
import { getServerVersion, getVersion, go, loadProgress, read, subscribe } from "@/lib/store";
import { BadgeToast } from "./game/BadgeToast";
import { Home } from "./views/Home";
import { Lesson } from "./views/Lesson";
import { Pick } from "./views/Pick";
import { Rules } from "./views/Rules";
import { TypeView } from "./views/TypeView";
import { Words } from "./views/Words";
import { Chapter } from "./views/Chapter";
import { Me } from "./views/Me";
import { Review } from "./views/Review";
import { Card } from "./views/Card";
import { Ask } from "./views/Ask";
import { Boss } from "./views/Boss";

const VIEWS = { home: Home, lesson: Lesson, pick: Pick, type: TypeView, words: Words, rules: Rules, chapter: Chapter, me: Me, review: Review, card: Card, ask: Ask, boss: Boss };

export function Classroom() {
  useSyncExternalStore(subscribe, getVersion, getServerVersion);
  // 진도(localStorage)는 화면이 브라우저에 뜬 뒤에만 읽는다
  useEffect(() => loadProgress(), []);
  const { S, page, answers, game } = read();
  const lv = levelOf(xpOf(answers, game));
  const View = VIEWS[S.view];
  return (
    <div className="wrap">
      <div className="top">
        <button className="brand" onClick={() => go("home")}>
          코드 블록 교실
        </button>
        {/* 기획서 v2 M1: 레벨 표시. 누르면 내 기록. 프로토타입에 없는 요소라 data-new */}
        <button className="lvl" data-new="game" onClick={() => go("me")} aria-label={`레벨 ${lv.n} ${lv.name}, 내 기록 보기`}>
          Lv.{lv.n}
        </button>
        <div className="score" id="score">
          {`정답 ${S.score} / ${S.max}`}
        </div>
      </div>
      <main id="app">
        <View key={page} />
      </main>
      <BadgeToast />
      <p className="foot">교육용 프로토타입 · 설명은 화면 아래 표시한 공식 문서로 2026-11-09에 확인, 비유·일반 설명은 &apos;출처 없음&apos;으로 표시 · 실험은 실제 서비스가 아닌 시뮬레이션</p>
    </div>
  );
}
