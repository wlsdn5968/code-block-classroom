# 코드 블록 교실 — 프로젝트 안내 (매 세션 자동 로드)

AI를 쓰는 비개발자가 "AI가 지금 뭘 하자는 건지" 판단하도록 돕는 게임형 학습 웹사이트.
목표: 누구나 AI를 더 안전하고, 쉽고, 이해하면서 쓰게 하는 가이드라인. 글은 초등 고학년도 알아듣게.

**새 세션은 먼저 [docs/HANDOFF.md](docs/HANDOFF.md)를 읽는다.** (지금 상태, 대기 중인 승인, 다음 할 일)

## 반드시 지킬 규칙 (운영자가 매번 강조한 것)

1. **추측 금지, 환각 배제.** 사실은 파일·원문·실행 결과로 확인한 것만 쓴다. 확인하지 못한 것은 "확인하지 못함"이라고 쓴다.
2. **크로스체크.** 변경마다 독립 검토(낮은 등급 모델 에이전트, 읽기 전용)를 받는다. 검토 지적은 그대로 믿지 말고 코드·원문에서 직접 확인한 뒤 반영한다. 지적을 고친 뒤의 **최종본도 한 번 더** 검토받고 합친다.
3. **병렬 작업은 낮은 등급 모델 에이전트로** 토큰을 아낀다. 품질 판단은 주 세션이 한다. 에이전트와 검사를 동시에 많이 돌리면 이 PC에서 검사가 시간 초과로 실패할 수 있다(2026-11-10 실제 발생).
4. **화면에 나가는 문장은 승인 없이 바꾸지 않는다.** 새 문장·바뀐 문장은 미리보기와 함께 보고 → 승인 → 반영. 승인 전 PR에는 자동 merge를 켜지 않는다.
5. **출처 없는 사실 문장 금지.** 원문을 직접 내려받아 글자 그대로 대조한 인용(`evidence`)을 붙인다. 원문에 없는 내용은 넣지 않는다.
6. **다른 프로젝트는 손대지도, 보지도 않는다.** 이 저장소와 이 프로젝트의 Vercel·GitHub만 다룬다. `.env` 등 비밀 파일은 열지 않는다.
7. **main에 직접 커밋하지 않는다.** 브랜치 → PR → CI(`check`) 통과 → merge. merge는 Claude가 해도 된다.
8. **운영자에게 부탁할 일**은 무엇을·왜·안 하면 어떻게 되는지·급한지·누를 버튼까지 쉬운 말로 적는다. Claude가 할 수 있는 일은 Claude가 다 한다.
9. 모든 출력은 한국어(운영자 전역 규칙). 코드·명령어·경로만 원문.

## 기술 스택과 명령어

- Next.js 16.4.4 (App Router, `output: "export"` 정적 내보내기), React 19, TypeScript. 서버·DB·로그인 없음.
- 배포: Vercel(팀 Gyeol Lab, 프로젝트 `code-block-classroom`), main 푸시 시 자동 배포. 실제 주소 https://code-block-classroom.vercel.app
- 저장소: github.com/wlsdn5968/code-block-classroom (Public). 자동 merge 켜짐, main 필수 검사 `check`.

```bash
npm ci
npx playwright install chromium   # 처음 1회
npm run build                     # 빌드 전 검사(출처·게임 규칙·이식 검증)가 먼저 돈다. 결과는 out/
npm run test:parity               # 프로토타입과 화면 동등성 (77 시나리오)
npm run test:walk                 # 수강생 전 과정 검사 (휴대폰·다크·데스크톱)
npx tsc --noEmit --incremental false
node scripts/perf-audit.mjs 8     # 성능 실측(빌드 뒤)
node scripts/measure-text.mjs     # 글 분량 실측
```

실제 주소 검사: `APP_URL=https://code-block-classroom.vercel.app/ npm run test:walk` (main의 검사 파일로 돌릴 것)

## 디렉터리

| 경로 | 내용 |
|---|---|
| `content/` | 콘텐츠 JSON. `sources.json`(출처), `blocks/`, `types/`, `chapters/ai-work·ops/`, `phrases.json`, `rules.json`, `game/`(레벨·배지·목표·보스) |
| `lib/` | `content.ts`(콘텐츠 묶기), `store.ts`(화면 상태·브라우저 저장), `game.ts`(경험치·배지·지도 판정), `kit.ts`·`card.ts`(수칙 카드·질문 꾸러미) |
| `components/` | `views/`(화면), `labs/`(실험실 9), `widgets/`(화면 부품 8), `game/`(지도·알림·목표) |
| `scripts/` | 빌드 전 검사와 측정 도구. `extract-content.mjs`는 **다시 실행 금지**(content를 덮어씀) |
| `tests/` | `parity.mjs`, `walkthrough.mjs` |
| `prototype/`, `docs/code-block-classroom-plan.md` | 원본. **수정 금지** |

## 작업할 때 알아 둘 것

- **이 PC의 Bash 도구는 스크립트 안의 역슬래시를 지운다**(정규식 `\s`, `\n`, `\(` 등이 사라짐. 2026-11-10 네 번 재발). 정규식·역슬래시가 든 코드는 Write/Edit 도구로 직접 쓴다.
- 파일 줄바꿈이 CRLF/LF 섞여 있다. 여러 줄 치환은 파일의 줄바꿈을 감지해서 한다.
- 새 화면 요소는 `data-new` 표시를 붙여야 동등성 검사에서 빠진다(프로토타입에 없는 요소).
- 글자색 대비 4.5 이상, 버튼·입력 글자색은 명시(Android 버그 이력).
- 임시 폴더(scratchpad)는 앱이 다시 켜지면 비워진다. 계속 쓸 도구는 `scripts/`에 둔다.
- 이 Next.js는 학습 자료와 다를 수 있다. 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 해당 안내를 읽는다([AGENTS.md](AGENTS.md)).

## 상세 문서

- [docs/HANDOFF.md](docs/HANDOFF.md) — 지금 상태, 대기 중인 승인, 다음 할 일
- [docs/architecture.md](docs/architecture.md) — 구조와 데이터 흐름, 검사 장치
- [docs/db-schema.md](docs/db-schema.md) — DB 없음. 브라우저 저장소 모양
- [docs/decisions.md](docs/decisions.md) — 결정과 이유(날짜별)
- [docs/plan-v2-game.md](docs/plan-v2-game.md) — 기획서 v2(게임·쉬운 말·로드맵 M1~M6)
- [docs/content-port-report.md](docs/content-port-report.md) — 작업 이력 전부(절 번호로 참조)
