# 코드 블록 교실

AI로 서비스를 만드는 비개발자가 "AI가 지금 뭘 하자는 건지" 판단할 수 있게 해주는 게임형 학습 웹사이트.
기획·개발안: [docs/code-block-classroom-plan.md](docs/code-block-classroom-plan.md) · 원본 프로토타입: [prototype/](prototype/)

## 현재 단계: 1단계 MVP (로그인 없는 정적 사이트)

실제 주소: https://code-block-classroom.vercel.app (Vercel, main 브랜치 자동 배포)

- Next.js 정적 내보내기(`output: "export"`). `npm run build` 하면 `out/` 폴더가 생긴다.
- 콘텐츠는 `content/` JSON, 화면은 `components/`. 진도는 브라우저(localStorage)에만 저장.

## 폴더

| 경로 | 내용 |
|---|---|
| `content/sources.json` | 출처 29건 (title, url, kind, checkedAt, volatile) |
| `content/blocks/` | 블록 레슨 9개 (`order.json`이 순서) |
| `content/types/` | 서비스 유형 7개 (`order.json`이 순서) |
| `content/phrases.json` | AI 말 번역기 19개 |
| `content/rules.json` | 공통 규칙 3개 |
| `components/views/` | 홈·블록 레슨·유형 고르기·유형·번역기·공통 규칙 화면 |
| `components/labs/` | 실험실 9개 (시뮬레이션) |
| `lib/store.ts` | 화면 상태·점수·진도 저장 |
| `scripts/` | 이식·검사 스크립트 |
| `tests/parity.mjs` | 프로토타입과 화면 동등성 검사 |

## 명령

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 내 컴퓨터에서 미리보기 (localhost:3000) |
| `npm run build` | 출처 검사 → 이식 검증 → 정적 빌드. 검사 하나라도 실패하면 빌드가 멈춘다 |
| `npm run check:sources` | 출처 검사만 (`-- --verbose`로 출처 칸 없는 항목 목록) |
| `npm run verify:port` | content JSON이 프로토타입 원문과 글자 단위로 같은지 확인 |
| `npm run test:parity` | 빌드 결과와 프로토타입을 브라우저에서 같은 순서로 조작해 화면 비교 (Playwright 필요). `APP_URL=https://code-block-classroom.vercel.app/ npm run test:parity`로 실제 배포와 비교할 수 있다 |

## 콘텐츠 수정 규칙 (기획안 5장)

1. 출처 칸이 있는 항목(블록 설명·번역기·미션 해설·공통 규칙)은 출처 id가 1개 이상 있어야 한다. 없으면 빌드 실패.
2. 문장을 고치면 `npm run verify:port`가 실패한다. 의도한 수정이면 `scripts/verify-port.mjs`의 `INTENDED_CHANGES`에 위치와 이유를 적는다.
3. AI가 쓴 초안은 사람이 출처 원문과 대조한 뒤에만 합친다(merge).
