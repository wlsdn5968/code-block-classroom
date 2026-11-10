# 데이터 저장 (db-schema)

마지막 확인 2026-11-10 (main `2b00d81`, `lib/store.ts` 기준).

## DB: 해당 없음

이 프로젝트에는 DB도 Supabase도 없다(1단계: 로그인 없는 정적 사이트). 테이블, RLS, 마이그레이션이 없다.
2단계에서 쓸 표 2개(`profiles`, `progress`)는 원래 기획안(`docs/code-block-classroom-plan.md` 6장)에 설계만 있다.

## 브라우저 저장소 (localStorage)

사용자의 진도는 그 브라우저에만 남는다. 서버로 보내지 않는다. 키는 5개다.

| 키 | 모양 | 뜻 | 쓰는 곳 |
|---|---|---|---|
| `cs-answers` | `{ "문제 키": [고른 답 번호, 맞으면 1 틀리면 0] }` | 문제마다 **첫 답만** 기록. 점수판과 경험치의 바탕 | `tally()` |
| `cs-seen` | `{ "블록 id": 1 }` | 맞혀보기에 답한 블록 | `guess()` |
| `cs-cseen` | `{ "레슨 id": 1 }` | 맞혀보기에 답한 챕터 레슨 | `cguess()` |
| `cs-done` | `{ "유형 id": 1 }` | 끝낸 서비스 유형 | `finish()` |
| `cs-game` | `{ v: 1, ev, words, review, quest, boss }` | 게임 기록(아래) | `gameEvent()` 등 |

문제 키 4종: `block:<블록 id>`, `chapter:<레슨 id>`, `mission:<유형 id>:<번호>`, `key:<번호>`(열쇠 실험실).

`cs-game` 안:

| 칸 | 모양 | 뜻 |
|---|---|---|
| `ev` | `{ "사건 id": 1 }` | 배지 판정용 사건 6개(`GAME_EVENTS`) |
| `words` | `{ "묶음 id": 1 }` | 열어 본 AI 말 번역기 묶음 |
| `review` | `{ "문제 키": 1 }` | 복습함에서 다시 맞힌 문제 |
| `quest` | `{ "목표 id": 1 }` | 달성한 실험실 목표 8개(`GAME_QUESTS`) |
| `boss` | `{ "챕터 id": 1~3 }` | 챕터 보스의 가장 높은 별 수 |

## 지키는 규칙 (코드로 강제)

- **읽을 때 검증한다.** 저장값이 망가졌거나(`null`, 배열 등) 지금 콘텐츠에 없는 id면 버린다. 화면이 멈추지 않는다(`readAnswers`, `readDone`, `readSeen`, `readCseen`, `cleanGame`).
- **다른 탭의 기록을 지우지 않는다.** 저장 직전에 다시 읽어 합친다.
- **기록은 줄지 않는다.** 진도 파일을 불러오면 지금 기록에 합친다(첫 답은 지금 것을 유지, 보스 별은 높은 쪽). 모양이 틀린 파일은 거부한다(`importProgress`).
- 경험치·레벨·배지는 저장하지 않고 기록에서 매번 계산한다(`lib/game.ts`).
- 크기: 성능 측정 스크립트로 전 과정을 8바퀴 돈 뒤 5개 키 합계 624자(2026-11-10 실측, `node scripts/perf-audit.mjs 8`). 문제·목표·보스 수가 정해져 있어 끝없이 늘지 않는다.

## 진도 파일 (내보내기·불러오기)

`{ kind: "code-block-classroom-progress", v: 1, savedAt, answers, done, seen, cseen, game }`. 브라우저 안에서만 만들고 읽는다. 개인정보는 들어 있지 않다.
