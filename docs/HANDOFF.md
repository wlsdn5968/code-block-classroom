# 인수인계 (HANDOFF)

갱신 2026-11-18. 지금 이어서 작업하는 데 필요한 것만 적는다. 규칙은 [CLAUDE.md](../CLAUDE.md), 대화에만 있던 원칙은 [principles.md](principles.md), 이력은 `docs/content-port-report.md`(최근 28절), 결정은 `docs/decisions.md`. CLEAR 뒤 붙여 넣을 프롬프트는 [next-session-prompt.md](next-session-prompt.md).

## 지금 상태
- M4(쉬운 말 다시 쓰기) 끝. main `976f417`에서 레슨 12개 모두 쉬운 말 경고 0. 실제 주소 정상: 전 과정 검사 348곳 문제 0(2026-11-18).
- 쉬운 말 검사(`scripts/check-plain.mjs`)는 문제가 하나라도 있으면 빌드를 멈춘다(브랜치 `tools/check-plain-fail`, 이 브랜치가 합쳐진 뒤부터).
- 승인 대기 PR 없음.

## 다음 할 일
1. `perm`에 "새 버전은 auto 모드로 시작한다" 넣기(운영자 승인 필요). 새 출처(권한 모드 문서)를 더하면 화면의 "2026-11-09 확인" 문구 2곳(`components/Classroom.tsx`, `components/views/Rules.tsx`)과 `tests/parity.mjs`도 바꿔야 한다. 보고서 28-3.
2. 기존 문장 문제: 보고서 28-3(`skill`·`perm`), 26-3·26-5·26-6(`pileup` 숫자·낱말 4곳, `aidelete`의 'AI에게 이렇게 물어보세요' 표 풀이, `ctx`·`mcp`의 남은 검토 지적). 레슨을 고칠 때 900자·60자를 넘으면 이제 빌드가 실패한다.
3. M5 새 지역 "비밀과 개인정보 지키기"(plan-v2 7장), 그다음 M6. 출처 재확인 마감 **2027-02-02**(`content/sources.json`, 자주 바뀌는 출처 32건).
4. 운영자 몫: 실제 기기(Android·iPhone) 점검, 기획안 10장 결정(이름·수익화·도메인).

## 알아 둘 것
- 임시 폴더(scratchpad)는 앱을 다시 켜면 비워진다. 계속 쓸 도구는 `scripts/`(레슨 도우미 `lesson-tools.mjs`). 출처 원문 보관본이 없어 인용 대조는 매번 원문을 내려받아서 한다.
- 한 표현을 고칠 때는 레슨만이 아니라 보스·사건·수칙 카드(`content/game/`, `lib/kit.ts`)까지 같이 찾는다(28-5에서 보스 해설을 놓쳤다).
- 쉬운 말 검사(`scripts/check-plain.mjs`): 영어 낱말은 바로 뒤의 괄호 풀이만 인정하고 괄호 안의 영어는 보지 않는다. 코드 글꼴(`<code>`)과 표는 문장 길이·영어 검사에서 빠지지만 900자에는 들어간다.
- 화면의 확인일 문구는 `content/sources.json`의 가장 최근 `checkedAt`과 같아야 빌드 전 검사를 통과한다(`scripts/check-sources.mjs`).
- 올리지 않은 패키지: TypeScript 7, ESLint 10. 개발 도구 보안 경고 7건(minimatch). 보고서 25-4. 이미 합쳐진 브랜치는 그대로 둔다(2026-11-17 승인).
