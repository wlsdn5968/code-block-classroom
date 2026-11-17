# AI 티 점검 방법 (CLAUDE.md 규칙 12의 상세)

2026-11-17 정리 때 CLAUDE.md 규칙 12의 하위 항목 4개를 글자 그대로 옮겼다. 규칙 자체는 [CLAUDE.md](../CLAUDE.md) 12번.

- 순서: 레슨 화면 글(질문·해설·단락·한 줄 정리)을 글만 뽑아 `<폴더>/01_input.txt`에 저장 → 도구 폴더의 `scripts/prepare_monolith_input.py --run-dir <폴더> --genre essay`로 `01_input_with_metrics.txt` 생성(측정값과 위험 등급이 붙음) → `humanize-korean:humanize-diagnostician` 에이전트에 그 파일과 `skills/humanize-korean/references/diagnosis-rules.md`를 주면 `02_diagnosis.md`가 나온다. 도구가 "light"를 권해도 진단을 돌린다. 진단 없이 윤문만 하면 거의 안 고쳐진다(변경률 0.1~0.8%, 2026-11-12 실측).
- 반영한 뒤에는 연결어미 쉼표(규칙집 C-11: -고/-며/-지만/-면서/-아서·어서/-자/-는데)를 원래 있던 것까지 0개로 만들고(줄어든 꼴 `잠가서·해서·져서`도 같은 어미다. 측정 코드는 `-고/-며/-지만/-면서/-아서/-어서` 글자만 세서 줄어든 꼴과 `-자`·`-는데`를 놓친다. 그래서 "한글+서,"와 규칙집 어미 전부로 따로 찾고, 단락 제목도 본다), 도구 폴더의 `scripts/verify_change_rate.py --before 전.txt --after 후.txt`로 변경률을 잰다(30% 경고, 50% 중단).
- 도우미: `node scripts/lesson-tools.mjs comma <챕터> <id...>`(연결어미 쉼표 찾기, 제목·보기 포함), `verify`(main과 비교해 근거 인용·부품·순서 확인), `extract`(im-not-ai 입력용 글 뽑기), `packet`(검토 자료).
- **E-1(긴 문장 만들기)은 쓰지 않는다.** 규칙 10(한 문장 60자)과 충돌하기 때문이다. 사실·숫자·근거 인용은 바꾸지 않는다. 진단 결과는 그대로 믿지 않고 문장마다 직접 판정한다.
