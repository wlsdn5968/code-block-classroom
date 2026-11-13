# 코드 블록 교실 — 프로젝트 안내 (매 세션 자동 로드)

AI를 쓰는 비개발자가 "AI가 지금 뭘 하자는 건지" 판단하도록 돕는 게임형 학습 웹사이트.
목표: 누구나 AI를 더 안전하고, 쉽고, 이해하면서 쓰게 하는 가이드라인. 글은 초등 고학년도 알아듣게.

**새 세션은 먼저 [docs/HANDOFF.md](docs/HANDOFF.md)를 읽는다.** (지금 상태, 대기 중인 승인, 다음 할 일)

## 반드시 지킬 규칙 (운영자가 매번 강조한 것)

1. **추측 금지, 환각 배제.** 사실은 파일·원문·실행 결과로 확인한 것만 쓴다. 확인하지 못한 것은 "확인하지 못함"이라고 쓴다.
2. **크로스체크.** 변경마다 독립 검토(낮은 등급 모델 에이전트, 읽기 전용)를 받는다. 검토 지적은 그대로 믿지 말고 코드·원문에서 직접 확인한 뒤 반영한다. 지적을 고친 뒤의 **최종본도 한 번 더** 검토받고 합친다.
   - 순서(2026-11-12 정리): 초안 → 독립 검토 → 반영 → 바뀐 부분 재검토 → **그 최종본으로 운영자 승인** → 합치기. 예전 순서(승인 → 재검토)에서는 재검토에서 고칠 것이 나오면 승인받은 문장이 승인 뒤에 바뀔 수 있었다(M3는 승인 기록과 같은 커밋에서 문장 2곳이 더 바뀌었다).
   - 재검토는 지적을 반영해 **바뀐 부분만** 본다. 반영한 것이 없으면 첫 검토가 최종본 검토다.
   - 콘텐츠 검토는 두 가지를 같이 묻는다: 사실이 원문과 맞는가, **초등 고학년이 읽을 수 있는가**(규칙 10).
3. **병렬 작업은 낮은 등급 모델 에이전트로** 토큰을 아낀다. 품질 판단은 주 세션이 한다. 에이전트와 검사를 동시에 많이 돌리면 이 PC에서 검사가 시간 초과로 실패할 수 있다(2026-11-10 실제 발생).
4. **화면에 나가는 문장은 승인 없이 바꾸지 않는다.** 새 문장·바뀐 문장은 미리보기와 함께 보고 → 승인 → 반영. 승인 전 PR에는 자동 merge를 켜지 않는다. 승인 뒤에는 문장을 더 고치지 않는다(고쳐야 하면 다시 승인). 승인 기록은 PR 댓글로 남기고 문서에는 다음 문서 갱신 때 적는다(코드 PR에 문서 커밋을 얹으면 전체 검사가 한 번 더 돈다).
5. **출처 없는 사실 문장 금지.** 원문을 직접 내려받아 글자 그대로 대조한 인용(`evidence`)을 붙인다. 원문에 없는 내용은 넣지 않는다.
6. **다른 프로젝트는 손대지도, 보지도 않는다.** 이 저장소와 이 프로젝트의 Vercel·GitHub만 다룬다. `.env` 등 비밀 파일은 열지 않는다.
7. **main에 직접 커밋하지 않는다.** 브랜치 → PR → CI(`check`) 통과 → merge. merge는 Claude가 해도 된다.
8. **운영자에게 부탁할 일**은 무엇을·왜·안 하면 어떻게 되는지·급한지·누를 버튼까지 쉬운 말로 적는다. Claude가 할 수 있는 일은 Claude가 다 한다.
9. 모든 출력은 한국어(운영자 전역 규칙). 코드·명령어·경로만 원문.
10. **쉬운 말은 사실만큼 중요하다.** 레슨에서 기본으로 보이는 부분은 900자, 한 문장 60자 안쪽(`node scripts/check-plain.mjs --verbose`). 검토가 조건·예외를 더하라고 하면 기본 단락이 아니라 "더 깊이 보기"에 넣는다. 이 기준 없이 쓰고 검토해서 레슨 12개 중 11개가 기준을 넘었고, M4에서 다시 쓰게 됐다(보고서 25절).
11. **PR은 작게.** 기능 코드와 새 화면 문장은 되도록 다른 PR로 나눈다. 레슨 다시 쓰기는 2~3개씩 묶는다. 문서(`docs/`, 루트 `*.md`)만 바꾸는 PR은 화면 검사를 건너뛰어 빨리 끝난다.
12. **AI 티 점검은 im-not-ai로 한다(운영자 지시, 2026-11-12 재확인).** 이 PC에 설치된 `humanize-korean` 2.3.2(github.com/epoko77-ai/im-not-ai, 경로 `C:\Users\cbrekr\.claude\plugins\cache\im-not-ai\humanize-korean\2.3.2`)를 쓴다. 화면 문장을 새로 쓰거나 고칠 때마다 한다.
   - 순서: 레슨 화면 글(질문·해설·단락·한 줄 정리)을 글만 뽑아 `<폴더>/01_input.txt`에 저장 → 도구 폴더의 `scripts/prepare_monolith_input.py --run-dir <폴더> --genre essay`로 `01_input_with_metrics.txt` 생성(측정값과 위험 등급이 붙음) → `humanize-korean:humanize-diagnostician` 에이전트에 그 파일과 `skills/humanize-korean/references/diagnosis-rules.md`를 주면 `02_diagnosis.md`가 나온다. 도구가 "light"를 권해도 진단을 돌린다. 진단 없이 윤문만 하면 거의 안 고쳐진다(변경률 0.1~0.8%, 2026-11-12 실측).
   - 반영한 뒤에는 연결어미 쉼표(규칙집 C-11: -고/-며/-지만/-면서/-아서·어서/-자/-는데)를 원래 있던 것까지 0개로 만들고(줄어든 꼴 `잠가서·해서·져서`도 같은 어미다. 측정 코드는 `-고/-며/-지만/-면서/-아서/-어서` 글자만 세서 줄어든 꼴과 `-자`·`-는데`를 놓친다. 그래서 "한글+서,"와 규칙집 어미 전부로 따로 찾고, 단락 제목도 본다), 도구 폴더의 `scripts/verify_change_rate.py --before 전.txt --after 후.txt`로 변경률을 잰다(30% 경고, 50% 중단).
   - 도우미: `node scripts/lesson-tools.mjs comma <챕터> <id...>`(연결어미 쉼표 찾기, 제목·보기 포함), `verify`(main과 비교해 근거 인용·부품·순서 확인), `extract`(im-not-ai 입력용 글 뽑기), `packet`(검토 자료).
   - **E-1(긴 문장 만들기)은 쓰지 않는다.** 규칙 10(한 문장 60자)과 충돌하기 때문이다. 사실·숫자·근거 인용은 바꾸지 않는다. 진단 결과는 그대로 믿지 않고 문장마다 직접 판정한다.

## 기술 스택과 명령어

- Next.js 16.4.6 (App Router, `output: "export"` 정적 내보내기), React 19, TypeScript 6. 서버·DB·로그인 없음. Node는 CI·Vercel 모두 26.
- 올리지 않은 것(2026-11-12 등록 정보 확인): TypeScript 7(typescript-eslint가 6.0까지만 지원), ESLint 10(eslint-plugin-react·import·jsx-a11y가 9까지만 지원). 지원이 나오면 올린다.
- 배포: Vercel(팀 Gyeol Lab, 프로젝트 `code-block-classroom`), main 푸시 시 자동 배포. 실제 주소 https://code-block-classroom.vercel.app
- 저장소: github.com/wlsdn5968/code-block-classroom (Public). 자동 merge 켜짐, main 필수 검사 `check`.

```bash
npm ci
npx playwright install chromium   # 처음 1회
npm run build                     # 빌드 전 검사(출처·게임 규칙·이식 검증)가 먼저 돈다. 결과는 out/
npm run test:parity               # 프로토타입과 화면 동등성 (77 시나리오)
npm run test:walk                 # 수강생 전 과정 검사 (휴대폰·다크·데스크톱)
npx tsc --noEmit --incremental false
npm run lint                      # 문법 검사 (CI에도 들어 있다)
node scripts/perf-audit.mjs 8     # 성능 실측(빌드 뒤)
node scripts/measure-text.mjs     # 글 분량 실측
```

실제 주소 검사: `APP_URL=https://code-block-classroom.vercel.app/ npm run test:walk` (main의 검사 파일로 돌릴 것)

## 일하는 순서 (이유는 보고서 25절)

1. 상태 확인: `git status`, 열린 PR, 필요하면 실제 주소 검사.
2. 브랜치를 만들어 작업한다. PR은 작게(규칙 11).
3. 새 콘텐츠는 공식 문서 원문을 내려받아 인용(`evidence`)을 글자 그대로 대조한다. 초안부터 쉬운 말 기준(규칙 10)을 지킨다.
4. 타입 검사 → 문법 검사 → 빌드 → `test:parity` → `test:walk`. 무거운 검사는 혼자 돌린다.
5. 독립 검토(사실 + 쉬움) → 지적을 직접 확인하고 반영 → 바뀐 부분만 재검토.
6. PR을 만든다. 화면 문장이 바뀌면 자동 merge를 켜지 않고, 최종본을 고치기 전·후 대조표와 함께 운영자에게 보고한다.
7. 승인되면: 문장은 더 고치지 않는다 → 승인 기록은 PR 댓글 → merge → 실제 주소 확인.
8. 보고서(`docs/content-port-report.md`)에 절을 추가하고 `docs/HANDOFF.md`를 갱신한다.

보고할 때는 한 일·검증·확인하지 못한 것·운영자가 할 일을 쉬운 말로 적는다.

## 작업 상태 관리 (운영자 지시 2026-11-12)

- `docs/HANDOFF.md`는 "지금 이어서 작업하려면 알아야 할 것"만 담는다. 이력 기록용이 아니다(이력은 `docs/content-port-report.md`, 결정은 `docs/decisions.md`).
- 갱신 시점은 Claude가 판단한다. 다음 중 하나면 갱신: 기능·버그 하나가 완료됨, 중요한 설계 결정을 내림, 시도한 방법을 폐기함.
- 갱신할 때는 항상 **전체를 덮어쓴다**. 끝난 일, 더 이상 유효하지 않은 내용은 지운다.
- **30줄을 넘으면** 오래 유지할 규칙은 이 파일(CLAUDE.md)로 옮기고, 나머지는 삭제한다.
- 코드는 적지 않고 파일 경로만 적는다.
- 갱신했다는 사실은 한 줄로만 알리고, 내용을 대화에 반복하지 않는다.

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
- [docs/audit-2026-11-12.md](docs/audit-2026-11-12.md) — 가장 최근 용량·성능 점검(앞선 것은 `docs/audit-2026-11-10.md`)
