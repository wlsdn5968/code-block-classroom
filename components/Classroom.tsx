"use client";
// 코드 블록 교실 전체 화면. 프로토타입 v4와 같은 화면 구조·동작을 React로 옮긴 것.
import { useEffect, useSyncExternalStore } from "react";
import { getServerVersion, getVersion, go, loadProgress, read, subscribe } from "@/lib/store";
import { Home } from "./views/Home";
import { Lesson } from "./views/Lesson";
import { Pick } from "./views/Pick";
import { Rules } from "./views/Rules";
import { TypeView } from "./views/TypeView";
import { Words } from "./views/Words";

const VIEWS = { home: Home, lesson: Lesson, pick: Pick, type: TypeView, words: Words, rules: Rules };

export function Classroom() {
  useSyncExternalStore(subscribe, getVersion, getServerVersion);
  // 진도(localStorage)는 화면이 브라우저에 뜬 뒤에만 읽는다
  useEffect(() => loadProgress(), []);
  const { S, page } = read();
  const View = VIEWS[S.view];
  return (
    <div className="wrap">
      <div className="top">
        <button className="brand" onClick={() => go("home")}>
          코드 블록 교실<small>프로토타입 v3</small>
        </button>
        <div className="score" id="score">
          {`정답 ${S.score} / ${S.max}`}
        </div>
      </div>
      <main id="app">
        <View key={page} />
      </main>
      <p className="foot">교육용 프로토타입 · 모든 설명은 화면 아래 표시한 공식 문서로 2026-10-09에 확인 · 실험은 실제 서비스가 아닌 시뮬레이션</p>
    </div>
  );
}
