# 코드 블록 교실

AI로 서비스를 만드는 비개발자가 "AI가 지금 뭘 하자는 건지" 판단할 수 있게 해주는 게임형 학습 웹사이트.
기획·개발안: [docs/code-block-classroom-plan.md](docs/code-block-classroom-plan.md) · 기획서 v2: [docs/plan-v2-game.md](docs/plan-v2-game.md) · 원본 프로토타입: [prototype/](prototype/)
작업 규칙과 이어받기: [CLAUDE.md](CLAUDE.md), [docs/HANDOFF.md](docs/HANDOFF.md)

## 현재 단계: 1단계 (로그인 없는 정적 사이트)

실제 주소: https://code-block-classroom.vercel.app (Vercel, main 브랜치 자동 배포)

- Next.js 정적 내보내기(`output: "export"`). `npm run build` 하면 `out/` 폴더가 생긴다.
- 콘텐츠는 `content/` JSON, 화면은 `components/`. 진도는 브라우저(localStorage)에만 저장.

## 폴더 (숫자는 2026-11-18에 파일을 세어 확인)

| 경로 | 내용 |
|---|---|
| `content/sources.json` | 출처 99건 (title, url, kind, checkedAt, volatile). 그중 자주 바뀌는 출처(volatile) 33건 |
| `content/blocks/` | 블록 레슨 9개 (`order.json`이 순서) |
| `content/types/` | 서비스 유형 7개 (`order.json`이 순서) |
| `content/phrases.json` | AI 말 번역기 19개 |
| `content/rules.json` | 공통 규칙 3개 |
| `content/chapters/ai-work/` | 챕터 "AI와 일하는 법": 레슨 4개(`order.json`이 순서) + 번역기 5개(`phrases.json`). 각 항목의 `evidence`는 출처 원문 인용(감사용, 화면에 안 보임) |
| `content/chapters/ops/` | 챕터 "만든 다음에 터지는 것들": 레슨 8개(`order.json`이 순서) |
| `content/game/` | 게임 규칙: 레벨·배지·목표·보스 |
| `components/views/` | 화면(홈·블록 레슨·유형·번역기·공통 규칙·챕터·내 기록·복습함·수칙 카드·질문 꾸러미·보스) |
| `components/labs/` | 실험실 9개 (시뮬레이션) |
| `components/widgets/` | 챕터 레슨의 화면 부품 8개 |
| `lib/store.ts` | 화면 상태·점수·진도 저장 |
| `scripts/` | 빌드 전 검사, 측정, 레슨 다시 쓰기 도우미(`lesson-tools.mjs`) |
| `tests/` | `parity.mjs`(프로토타입과 화면 동등성), `walkthrough.mjs`(수강생 전 과정) |
| `docs/archive/` | 지난 기록 보관(이력 1~20절, 11-10 점검, 11-03 제안서) |

## 명령

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 내 컴퓨터에서 미리보기 (localhost:3000) |
| `npm run build` | 빌드 전 검사(출처 → 게임 규칙 → 쉬운 말 → 이식 검증) 뒤 정적 빌드. 하나라도 실패하면 빌드가 멈춘다(쉬운 말 검사도 2026-11-18부터 실패) |
| `npm run check:sources` | 출처 검사만 (`-- --verbose`로 출처 칸 없는 항목 목록) |
| `npm run verify:port` | content JSON이 프로토타입 원문과 글자 단위로 같은지 확인 |
| `npm run lint` | 문법 검사 |
| `npm run test:parity` | 빌드 결과와 프로토타입을 브라우저에서 같은 순서로 조작해 화면 비교 (Playwright 필요). `APP_URL=https://code-block-classroom.vercel.app/ npm run test:parity`로 실제 배포와 비교할 수 있다 |
| `npm run test:walk` | 휴대폰·다크·데스크톱에서 수강생 전 과정을 끝까지 풀며 확인 (Playwright 필요) |

## 콘텐츠 수정 규칙 (기획안 5장)

1. 출처 칸이 있는 항목(블록 설명·번역기·미션 해설·공통 규칙)은 출처 id가 1개 이상 있어야 한다. 없으면 빌드 실패. 출처가 필요 없는 설명·비유는 `noSource: "설명"` 또는 `"비유"`로 표시한다(화면에 '출처 없음'으로 보임).
2. 문장을 고치면 `npm run verify:port`가 실패한다. 의도한 수정이면 `scripts/verify-port.mjs`의 `INTENDED_CHANGES`에 위치와 이유를 적는다.
3. AI가 쓴 초안은 사람이 출처 원문과 대조한 뒤에만 합친다(merge).
4. `volatile: true`인 출처는 90일(분기 1회) 안에 원문을 다시 확인하고 `checkedAt`을 갱신한다. 넘기면 빌드 실패 (현재 값 기준 **2027-02-02**부터). 화면의 확인일(`components/Classroom.tsx`, `components/views/Rules.tsx`)은 가장 최근 `checkedAt`과 같아야 한다.
5. 출처가 전부 2차 자료인 항목에는 화면에 '2차 자료' 배지가 자동으로 붙는다.
