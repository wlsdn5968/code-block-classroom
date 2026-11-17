# CLEAR 뒤 붙여 넣을 인계 프롬프트

작성 2026-11-17. 아래 줄부터 끝까지 그대로 복사해 새 세션에 붙여 넣는다. 적힌 내용은 이 날 파일·명령으로 확인한 것이다. 상태는 바뀌므로 새 세션은 직접 다시 확인한다.

---

코드 블록 교실 프로젝트를 이어서 진행한다.
저장소: 이 PC의 code-block-classroom 폴더 (GitHub wlsdn5968/code-block-classroom, 공개 저장소. 실제 주소 https://code-block-classroom.vercel.app)

[목적]
AI를 쓰는 비개발자가 "AI가 지금 뭘 하자는 건지" 판단하도록 돕는 게임형 학습 웹사이트. 글은 초등 고학년도 알아듣게. 서버·DB·로그인 없는 정적 사이트(Next.js 정적 내보내기 + Vercel), 진도는 브라우저 localStorage에만.

[먼저 읽을 것 — 순서대로, 읽기 전에는 아무것도 고치지 마]
1. CLAUDE.md (반드시 지킬 규칙 1~13, 일하는 순서, 작업 상태 관리, 금지 사항)
2. docs/HANDOFF.md (지금 상태, 승인 대기, 다음 할 일)
3. docs/principles.md (대화에만 있던 운영자 원칙 원문)
4. 화면 문장을 고칠 때: docs/ai-tone-check.md (im-not-ai AI 티 점검 방법)
5. 필요하면: docs/decisions.md, docs/plan-v2-game.md, docs/content-port-report.md 25~27절, docs/architecture.md

[내 원칙 — 원문 그대로(docs/principles.md P-S1). 전역 규칙(~/.claude/CLAUDE.md)과 CLAUDE.md 규칙 1~13은 세션마다 자동으로 읽힌다]
- 절대 추측하지 말고 환각을 배제한다. 파일·원문·실행 결과로 확인한 것만 말하고, 확인 못 한 것은 "확인하지 못함"이라고 쓴다. 원인 분석도 기록이 보여 주는 만큼만 말한다.
- 크로스체크해서 빠지는 것 없이 한다. 변경마다 독립 검토를 받고, 검토 지적도 코드·원문에서 직접 확인한 뒤 반영한다. 반영해서 바뀐 부분은 한 번 더 검토받는다.
- 순서: 초안 → 독립 검토(사실 + 초등 고학년이 읽을 수 있는가) → 반영 → 바뀐 부분 재검토 → 그 최종본으로 내 승인 → 합치기. 승인 뒤에는 문장을 더 고치지 않는다.
- 병렬 작업이 필요하면 낮은 등급 모델 에이전트를 써서 토큰을 아낀다. 품질은 네가 판단한다. 무거운 검사와 에이전트를 동시에 돌리지 않는다.
- 화면에 나가는 문장은 내 승인 없이 바꾸지 않는다. 고치기 전·후 대조표와 함께 보고하고, 승인 전 PR에는 자동 merge를 켜지 않는다.
- 사실 문장은 공식 문서 원문을 직접 대조한 것만 쓴다. 쉬운 말 기준(기본 900자, 한 문장 60자)을 지키고, 조건·예외는 "더 깊이 보기"에 넣는다.
- PR은 작게 한다(레슨은 2~3개씩).
- 다른 프로젝트는 손대지도 보지도 않는다. .env 같은 비밀 파일은 열지 않는다.
- main에 직접 커밋하지 않는다(브랜치 → PR → CI 통과 → merge).
- docs/HANDOFF.md는 30줄 이내로, 갱신할 때 전체를 덮어쓰고, 갱신했다는 사실만 한 줄로 알린다.
- 모든 출력은 한국어, 초등학생도 알아듣는 쉬운 말로. 내가 할 일이 있으면 무엇을·왜·안 하면 어떻게 되는지·급한지·누를 버튼까지 설명하고, 네가 할 수 있는 건 네가 다 한다.

[그 밖의 원칙 — 아래는 요약이다. 원문은 괄호 안 위치에 있다]
- 화면 문장은 im-not-ai(https://github.com/epoko77-ai/im-not-ai, 이 PC에 humanize-korean 2.3.2로 설치)로 AI 티를 점검한다(원문: CLAUDE.md 규칙 12, docs/principles.md P-S3).
- 과정은 한국어로 설명, 추측 금지·근거 제시, 확인 불가는 확인 불가로 표기. 사실과 의견은 [확인됨] / [추정] / [확인 불가]로 구분하고, 측정하지 않은 수치는 쓰지 않는다(원문: CLAUDE.md 규칙 13, docs/principles.md P-S4).
- 삭제 대신 보관이 기본이다. 요청 범위 밖의 리팩터링·기능 변경·의존성 업그레이드는 하지 않고 제안만 한다(원문: docs/principles.md P-S4 6·7번).
- 매 요청에 붙이는 문장(원문: docs/principles.md P-S2).

[지금 상태 — 2026-11-17 확인. 실제 상태는 직접 다시 확인할 것]
- 동작하는 것: 실제 사이트. 전 과정 검사 336곳 문제 0(2026-11-13, main `d0115d7`). 이후 main에 합친 것은 도구(PR #38)와 문서 정리(문서만)뿐이다.
- 승인 대기: PR #37 `content/easy-m4-ctx-mcp`(레슨 '컨텍스트'·'MCP' 쉬운 말 + im-not-ai 점검, MCP 승인 문장의 사실 바로잡기 포함). 검사·검토 끝, 자동 merge 꺼짐.
- 안 된 것: M4 마지막 레슨 2개(skill, perm), check-plain을 빌드 실패로 바꾸기, M5·M6.
- 확인하지 못한 것: 실제 기기(Android·iPhone) 화면, 첫 화면 속도의 믿을 만한 기준선(3.5~12초로 흔들림).

[이번(2026-11-17)에 한 일 — 문서만, 보고서 27절]
- 보고서 1~20절을 docs/archive/로 옮김(글자 그대로, 기계 대조), 지난 점검·제안서 3개도 docs/archive/로.
- README·구조 문서의 틀린 숫자와 빠진 것을 고침, 결정 문서에 11-12~17 결정 6개 추가.
- CLAUDE.md 규칙 13(고정 규칙) 추가, 규칙 12 상세는 docs/ai-tone-check.md로, 대화 원칙은 docs/principles.md로.
- 검증: 옮긴 글 글자 대조, 문서 링크 검사, 원칙 목록 전후 대조, 독립 검토.

[다음에 바로 할 첫 작업]
1. git 상태·열린 PR·실제 사이트를 확인해 짧게 보고한다.
2. PR #37에 대한 내 답을 묻는다(비어 있으면 PR 본문의 고치기 전·후 대조표를 보여 주고 기다린다).
3. 승인되면: 승인 기록(PR 댓글) → 합치기 → 실제 사이트 확인 → skill·perm 초안(쉬운 말 + im-not-ai 점검)을 고치기 전·후 문장과 함께 보여 준다.

[알려진 문제·주의]
- 이 PC의 Bash 도구는 스크립트 안의 역슬래시를 지운다. 정규식이 든 코드는 Write/Edit 도구로 쓴다.
- 임시 폴더(scratchpad)는 앱을 다시 켜면 비워진다. 계속 쓸 도구는 scripts/에 둔다(레슨 도우미 scripts/lesson-tools.mjs).
- 무거운 검사(build·test:parity·test:walk·perf-audit)는 혼자 돌린다. 에이전트와 같이 돌리면 시간 초과로 실패한 적이 있다.
- im-not-ai 측정 코드는 연결어미 쉼표 중 일부(줄어든 꼴, -자·-는데)를 못 센다. lesson-tools.mjs comma로 따로 찾는다.

[건드리면 안 되는 것]
- prototype/, docs/code-block-classroom-plan.md(.docx 포함): 원본, 수정 금지.
- scripts/extract-content.mjs: 다시 실행 금지(content를 덮어씀).
- 다른 프로젝트, .env 같은 비밀 파일.

[명령]
npm ci / npx playwright install chromium(처음 1회) / npm run build / npm run test:parity / npm run test:walk / npx tsc --noEmit --incremental false / npm run lint / node scripts/check-plain.mjs --verbose / node scripts/lesson-tools.mjs comma <챕터> <id...>
실제 주소 검사: APP_URL=https://code-block-classroom.vercel.app/ npm run test:walk (main의 검사 파일로)
배포: main에 합치면 Vercel이 자동 배포.
