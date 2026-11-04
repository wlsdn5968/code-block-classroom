# 승인용 초안 — 신규 챕터 "AI와 일하는 법"

작성 2026-11-03. 근거: Claude Code·Claude 플랫폼 공식 문서 6건(이 날 내려받음). 모든 문장은 해당 문서의 구절로 뒷받침되며, 인용 70건을 원문 파일과 자동 대조해 누락 0.

승인 전에는 사이트에 넣지 않는다. 승인 시: content/chapters/ai-work/ 에 JSON 4개 + 번역기 5개 추가, 홈 메뉴 5번 "AI와 일하는 법" 신설(블록 레슨과 같은 화면, 실험실 없음), 번역기 필터에 새 칩 추가, 출처 6건 등록.

## 컨텍스트 (컨텍스트 창 · CLAUDE.md)
**맞혀보기:** 어제 AI에게 "버튼은 항상 파란색으로 해줘"라고 말했어요. 오늘 새 세션을 열면 AI는 어제 대화를 알고 있을까요?  
보기: 알고 있다. 대화는 계속 이어진다 / 모른다. 새 세션은 이전 대화 없이 시작한다 / 하루가 지나야 잊는다 → 정답 2번  
해설: Claude Code 문서는 새 세션이 이전 세션의 대화 기록 없이, 새 컨텍스트 창으로 시작한다고 해요. 그래서 계속 지켜야 할 규칙은 CLAUDE.md에 적어 두는 거예요.

**컨텍스트 창 = AI의 작업 책상** (출처: claudectx, cchow)  
컨텍스트 창은 AI가 답을 만들 때 참고할 수 있는 글 전체예요.비유하면 책상 위에 펼쳐 둔 자료예요. 책상에 올라온 것만 보고 일하는 셈이죠. 실제로는 이 창이 AI가 학습한 방대한 데이터와는 별개인, 일종의 '작업 기억(working memory)'이라고 문서가 설명해요. Claude Code에서는 대화 기록, 파일 내용, 명령 출력, CLAUDE.md, 불러온 스킬 등이 여기에 들어가요.
  > [claudectx] The “context window” refers to all the text a language model can reference when generating a response, including the response itself.
  > [claudectx] This is different from the large corpus of data the language model was trained on, and instead represents a “working memory” for the model.
  > [cchow] Claude’s context window holds your conversation history, file contents, command outputs, CLAUDE.md, auto memory, loaded skills, and system instructions.

**많이 담는다고 좋은 게 아니에요** (출처: claudectx)  
문서에 따르면 토큰(글자 조각) 수가 늘수록 정확도와 기억력이 떨어지는 현상이 있고, 이를 context rot이라고 불러요. 그래서 '무엇을 담을지 고르는 것'이 '얼마나 담을 수 있는지'만큼 중요해요.
  > [claudectx] As token count grows, accuracy and recall degrade, a phenomenon known as context rot.

**세션은 매번 새로 시작해요** (출처: cchow)  
새 세션은 이전 세션의 대화 없이 시작해요. 이어지게 하는 방법은 두 가지로 문서에 나와요. Claude가 스스로 저장하는 자동 메모리(auto memory), 그리고 내가 직접 적는 CLAUDE.md예요.
  > [cchow] Claude can persist learnings across sessions using auto memory, and you can add your own persistent instructions in CLAUDE.md.

**CLAUDE.md = 매 세션 시작 때 읽는 메모** (출처: ccmemory)  
CLAUDE.md는 프로젝트에 대한 지침을 적는 일반 텍스트 파일이고, Claude는 세션을 시작할 때마다 읽어요. 저장소에 AGENTS.md가 있고 CLAUDE.md가 없으면 Claude가 AGENTS.md를 지침으로 읽어요. 주의할 점은 이 파일이 '강제 설정'이 아니라 참고 자료라는 거예요. 지침이 구체적이고 간결할수록 더 잘 따라요.
  > [ccmemory] You write these files in plain text; Claude reads them at the start of every session.
  > [ccmemory] By default, Claude reads AGENTS.md only when you have no CLAUDE.md in your working directory or above it.
  > [ccmemory] Claude treats them as context, not enforced configuration.
  > [ccmemory] The more specific and concise your instructions, the more consistently Claude follows them.

**꽉 차면 요약(compact)하고, 초반 지시는 사라질 수 있어요** (출처: cchow)  
대화가 길어져 한계에 가까워지면 Claude Code가 대화를 요약본으로 압축(compact)해요. 요약에는 내 요청과 핵심 코드가 남지만, 대화 초반에 한 자세한 지시는 사라질 수 있어요. 그래서 계속 지켜야 할 규칙은 대화가 아니라 CLAUDE.md에 두라고 문서가 말해요. 지금 무엇이 공간을 차지하는지는 /context로 볼 수 있어요.
  > [cchow] It compacts the conversation into a summary. The summary keeps your requests and key code snippets, but detailed instructions from early in the conversation may be lost.
  > [cchow] Put persistent rules in CLAUDE.md rather than relying on conversation history.
  > [cchow] Run /context to see what’s using space.

**무엇을 남길지 정할 수도 있어요** (출처: cchow)  
압축할 때 남길 내용을 정하려면 CLAUDE.md에 'Compact Instructions' 항목을 넣거나, /compact 뒤에 초점을 적어 실행하면 돼요. 예시: /compact focus on the API changes (문서의 예시 그대로예요).
  > [cchow] To control what’s preserved during compaction, add a “Compact Instructions” section to CLAUDE.md or run /compact with a focus (like /compact focus on the API changes).

**한 줄 정리:** 새 세션은 빈 상태로 시작해요. 계속 지킬 규칙은 CLAUDE.md에, 대화가 길어져 요약되면 초반 지시는 사라질 수 있어요.

## MCP (외부 도구 연결 · MCP)
**맞혀보기:** AI가 이슈 관리 도구나 모니터링 화면의 내용을 직접 읽고 처리하게 하려면 어떻게 해야 할까요?  
보기: 매번 내용을 복사해서 채팅에 붙여넣기만 가능하다 / MCP 서버를 연결하면 AI가 그 서비스를 직접 읽고 다룬다 / AI는 외부 서비스에 접근할 수 없다 → 정답 2번  
해설: 문서는 다른 도구에서 데이터를 채팅으로 계속 복사하고 있다면 서버를 연결할 때라고 해요. 연결하면 붙여넣은 내용에 의존하지 않고 그 시스템을 직접 읽고 다룰 수 있어요.

**MCP = AI와 도구를 잇는 공용 규격** (출처: ccmcp)  
비유하면 기기마다 다른 플러그를 하나로 맞춰 주는 공용 콘센트 규격이에요. 실제로는 MCP(Model Context Protocol)가 'AI와 도구를 연결하기 위한 오픈소스 표준'이라고 문서가 설명해요.
  > [ccmcp] Claude Code can connect to hundreds of external tools and data sources through the Model Context Protocol (MCP), an open source standard for AI-tool integrations.

**MCP 서버가 주는 것** (출처: ccmcp)  
MCP 서버는 Claude Code가 내 도구, 데이터베이스, API에 접근하게 해 줘요. 연결하면 Claude가 그 시스템을 직접 읽고 조작할 수 있어요. 문서가 드는 활용 예시 중 하나는 이래요. 예시: 이슈 추적기의 이슈를 보고 기능을 만든 뒤 GitHub에 PR을 만들게 하기.
  > [ccmcp] MCP servers give Claude Code access to your tools, databases, and APIs.
  > [ccmcp] Add the feature described in JIRA issue ENG-4521 and create a PR on GitHub.

**서버 추가는 명령 한 줄** (출처: ccmcp)  
원격 서비스에는 HTTP 방식이 권장돼요. 예시: 문서에 실린 Notion 연결 명령이에요.claude mcp add --transport http notion https://mcp.notion.com/mcp연결한 서버 목록은 claude mcp list로 볼 수 있어요.
  > [ccmcp] HTTP servers are the recommended option for connecting to remote MCP servers.
  > [ccmcp] claude mcp add --transport http notion https://mcp.notion.com/mcp
  > [ccmcp] # List all configured servers claude mcp list

**신뢰할 수 있는 서버만 연결해요** (출처: ccmcp)  
문서의 경고는 한 줄이에요. 서버를 연결하기 전에 믿을 만한지 확인하세요.외부 내용을 가져오는 서버는 프롬프트 인젝션 위험에 노출될 수 있다고 문서가 말해요. AI가 쓰는 도구가 곧 내 서비스와 데이터로 이어지는 문이니, 'MCP 서버를 추가할게요'라는 말이 나오면 어떤 서버인지 먼저 확인하세요.
  > [ccmcp] Verify you trust each server before connecting it. Servers that fetch external content can expose you to prompt injection risk.

**팀 저장소의 서버는 내가 승인해야 연결돼요** (출처: ccmcp)  
프로젝트 파일(.mcp.json)에 들어 있는 서버는 내가 아직 승인하지 않았다면 '승인 대기(Pending approval)'로 표시돼요. 내려받은 저장소가 스스로 서버를 승인할 수는 없어요.
  > [ccmcp] a project-scoped server from .mcp.json that you haven’t approved yet.
  > [ccmcp] A cloned repository can’t approve its own servers
  > [ccmcp] Pending approval (run `claude` to approve) : a project-scoped server from .mcp.json that you haven’t approved yet.

**한 줄 정리:** MCP는 AI와 외부 도구를 잇는 오픈 표준이에요. 서버는 믿을 수 있는 것만 연결하세요.

## 스킬 (스킬 · SKILL.md)
**맞혀보기:** 배포 전 체크리스트를 매번 AI에게 복사해서 붙여넣고 있어요. 문서가 권하는 방법은?  
보기: 계속 붙여넣는다 / SKILL.md로 스킬을 만들어 둔다 / CLAUDE.md에 무조건 전부 넣는다 → 정답 2번  
해설: 문서는 같은 지시·체크리스트·여러 단계 절차를 계속 붙여넣고 있을 때 스킬을 만들라고 해요.

**스킬 = 이름 붙여 둔 작업 설명서** (출처: ccskills)  
스킬은 SKILL.md 파일에 지시를 적어 두면 Claude가 도구함에 추가하는 기능이에요. 비유하면 레시피 카드예요. 실제로는 Claude가 알맞다고 판단할 때 스스로 쓰거나, 내가 /스킬이름으로 직접 부를 수 있다고 문서가 설명해요.
  > [ccskills] Create a SKILL.md file with instructions, and Claude adds it to its toolkit. Claude uses skills when relevant, or you can invoke one directly with /skill-name.

**언제 만들까요** (출처: ccskills)  
같은 지시나 체크리스트를 계속 붙여넣을 때, 또는 CLAUDE.md의 한 부분이 '사실'이 아니라 '절차'로 커졌을 때예요.
  > [ccskills] or when a section of CLAUDE.md has grown into a procedure rather than a fact.

**CLAUDE.md와 뭐가 달라요** (출처: ccskills, ccmemory)  
CLAUDE.md 내용은 세션마다 읽히지만, 스킬의 본문은 쓸 때만 불러와요. 그래서 긴 참고 자료를 스킬에 두면 필요하기 전까지 거의 부담이 없어요.
  > [ccskills] Unlike CLAUDE.md content, a skill’s body loads only when it’s used, so long reference material costs almost nothing until you need it.
  > [ccmemory] Keep it to facts Claude should hold in every session

**SKILL.md는 어떻게 생겼나** (출처: ccskills)  
두 부분이에요. 위쪽 --- 사이의 설명 머리말(frontmatter)은 언제 쓸지를 알려 주고, 아래쪽 마크다운은 실행할 때 따를 지시예요. 폴더 이름이 곧 명령 이름이 되고, description은 Claude가 자동으로 불러올지 판단하는 데 쓰여요. 예시: 문서의 예는 ~/.claude/skills/summarize-changes/SKILL.md에 저장하는 요약 스킬이에요.
  > [ccskills] The directory name, or the frontmatter name when you set one, becomes the command you type, and the description helps Claude decide when to load the skill automatically.
  > [ccskills] Save this to ~/.claude/skills/summarize-changes/SKILL.md

**어디에 두나** (출처: ccskills)  
내 모든 프로젝트에서 쓰려면 개인 폴더(~/.claude/skills/…), 이 저장소에서만 쓰려면 프로젝트 폴더(.claude/skills/…)에 둬요. 프로젝트 스킬은 저장소에 커밋해 둘 수 있어요.
  > [ccskills] Personal ~/.claude/skills/<skill-name>/SKILL.md All your projects on this machine
  > [ccskills] Project .claude/skills/<skill-name>/SKILL.md Sessions in this repository
  > [ccskills] commits it as a per-project skill at .claude/skills/run-<name>/

**내가 부를 때만 실행되게 할 수도 있어요** (출처: ccskills)  
배포처럼 조심할 작업은 frontmatter에 disable-model-invocation: true를 넣으면 Claude가 자동으로 불러오지 않고, 내가 /이름으로 부를 때만 써요.
  > [ccskills] Set to true to prevent Claude from automatically loading this skill. Use for workflows you want to trigger manually with /name.

**한 줄 정리:** 반복하는 절차는 SKILL.md로 만들어 두고 /이름으로 불러요. 본문은 쓸 때만 컨텍스트에 올라와요.

## 권한 승인 (권한 · 승인 창)
**맞혀보기:** 기본(수동) 모드에서 AI가 프로젝트 안의 파일을 <b>읽을 때</b>와 파일을 <b>고칠 때</b>, 각각 승인 요청이 뜰까요?  
보기: 둘 다 뜬다 / 읽기는 안 뜨고, 고치기는 뜬다 / 둘 다 안 뜬다 → 정답 2번  
해설: 문서 표에서 파일 읽기(Read-only)는 작업 폴더 안에서 승인이 필요 없고, 파일 수정(Edit/write)은 승인이 필요하다고 해요.

**승인 창 = AI가 하려는 일을 먼저 보여주는 창** (출처: ccperm)  
권한 승인 창은 Claude가 하려는 일을 보여주고 선택지를 줘요. 비유하면 결재 도장이에요. 실제로는 이 규칙을 지키는 건 AI의 마음이 아니라 Claude Code라고 문서가 말해요. 프롬프트나 CLAUDE.md에 적은 지시는 Claude가 시도할 일을 바꿀 뿐, Claude Code가 허용하는 범위를 바꾸지는 못해요.
  > [ccperm] A permission prompt shows what Claude is about to do, followed by your options.
  > [ccperm] Permission rules are enforced by Claude Code, not by the model.
  > [ccperm] Instructions in your prompt or CLAUDE.md shape what Claude tries to do, but they don’t change what Claude Code allows.

**읽기만 하는 건 보통 그냥 지나가고, 바꾸는 건 물어요** (출처: ccperm)  
일수동(Manual) 모드에서 승인파일 읽기, Grep필요 없음 (작업 폴더 안)파일 수정필요셸 명령(Bash)필요. 단, 내장된 읽기 전용 명령 묶음은 제외웹 검색필요읽기 전용으로 분류된 명령에는 ls, cat, grep, pwd 같은 것이 들어 있고, 이런 명령은 모든 모드에서 승인 없이 실행돼요.
  > [ccperm] Bash commands Shell execution Yes, except a built-in set of read-only commands
  > [ccperm] Web search WebSearch Yes
  > [ccperm] Claude Code recognizes a built-in set of Bash commands as read-only and runs them without a permission prompt in every mode
  > [ccperm] The set includes ls , cat , echo , pwd , head , tail , grep , find , wc , which , diff , stat , du , cd , and read-only forms of git .

**권한 모드: 얼마나 물을지 고르는 다이얼** (출처: ccperm, cchow)  
모드뜻default (수동/Manual)각 도구를 처음 쓸 때 물어요acceptEdits작업 폴더 안의 파일 수정과 mkdir, mv 같은 흔한 파일 명령을 묻지 않고 받아들여요plan파일을 읽고 읽기 전용 명령으로 살펴보기만 하고, 소스 파일은 고치지 않아요auto일상적인 질문 없이 진행하되, 셸 명령·네트워크 요청 같은 일은 배경의 분류기가 내 요청과 맞는지 확인해요dontAsk원래 물었을 호출을 모두 자동 거부해요bypassPermissions승인 창을 건너뛰어요터미널에서는 Shift+Tab으로 모드를 돌려 가며 바꿀 수 있어요.
  > [ccperm] default Prompts for permission on first use of each tool.
  > [ccperm] acceptEdits Automatically accepts file edits and common filesystem commands such as mkdir , touch , mv , and cp for paths in the working directory or additionalDirectories
  > [ccperm] plan Claude reads files and runs read-only shell commands to explore but doesn’t edit your source files
  > [ccperm] auto Runs without routine prompts; before actions such as shell commands and network requests run, a background classifier checks that they align with your request
  > [ccperm] dontAsk Auto-denies every call that would otherwise prompt
  > [ccperm] bypassPermissions Skips permission prompts, except for the actions no mode auto-approves
  > [cchow] Press Shift+Tab to cycle through the permission modes:

**bypassPermissions는 격리된 환경에서만** (출처: ccperm)  
이 모드는 승인 창을 건너뛰고, .git이나 .claude 같은 보호된 경로에 쓰는 것도 포함해요. 문서는 컨테이너나 VM처럼 격리된 환경에서만 쓰라고 해요. AI가 '권한을 bypass 모드로 바꿀게요'라고 하면 내 컴퓨터가 그런 환경인지 먼저 따져 보세요.
  > [ccperm] In bypassPermissions mode, Claude Code skips permission prompts, including for writes to protected paths such as .git and .claude.
  > [ccperm] Only use this mode in isolated environments like containers or VMs where Claude Code can’t cause damage.

**"Yes, and don't ask again"은 무엇을 저장하나** (출처: ccperm)  
이 선택지를 고르면 같은 종류의 요청을 다시 묻지 않아요. 다만 기간이 달라요. 셸 명령과 웹 가져오기는 그 저장소에서 계속 유지되고(.claude/settings.local.json에 규칙으로 저장), 파일 수정 승인은 세션이 끝날 때까지만 가요. 저장된 규칙은 /permissions에서 확인하고 관리할 수 있어요.
  > [ccperm] Claude Code saves the rule to .claude/settings.local.json at the root of the git repository
  > [ccperm] File modification Edit/write files Yes Until session end
  > [ccperm] You can view and manage Claude Code’s tool permissions with /permissions.
  > [ccperm] Web fetch WebFetch Yes, except a built-in set of preapproved documentation domains Permanently per repository and domain

**한 줄 정리:** 읽기는 대개 그냥 지나가고 고치기·실행은 물어요. 모드로 질문 빈도를 바꾸되, bypass는 격리된 환경에서만.

## AI 말 번역기 (추가 5개)
- **"MCP 서버를 추가할게요"** — 뜻: AI가 외부 서비스(이슈 도구, 데이터베이스 등)에 직접 접근할 수 있게 연결을 하나 만든다는 뜻이에요. / 확인할 것: 어떤 서버인지, 믿을 수 있는지 먼저 물어보세요. 외부 내용을 가져오는 서버는 프롬프트 인젝션 위험이 있다고 문서가 경고해요. (출처: ccmcp)
  > [ccmcp] MCP servers give Claude Code access to your tools, databases, and APIs.
  > [ccmcp] Verify you trust each server before connecting it.
- **"스킬로 만들어 둘게요"** — 뜻: 자주 반복하는 지시나 절차를 SKILL.md 파일로 저장해, 나중에 /이름으로 다시 쓰게 한다는 뜻이에요. / 확인할 것: 스킬이 개인용(~/.claude/skills)인지 프로젝트용(.claude/skills)인지 물어보세요. 프로젝트용은 저장소에 커밋해 둘 수 있어요. (출처: ccskills)
  > [ccskills] Create a SKILL.md file with instructions, and Claude adds it to its toolkit.
  > [ccskills] Project .claude/skills/<skill-name>/SKILL.md Sessions in this repository
  > [ccskills] commits it as a per-project skill at .claude/skills/run-<name>/
- **"권한을 bypass 모드로 바꿀게요"** — 뜻: 승인 창을 건너뛰고 AI가 묻지 않고 진행하게 한다는 뜻이에요. / 확인할 것: 컨테이너나 VM 같은 격리된 환경이 아니라면 거절하세요. 대신 수정 승인만 줄이는 acceptEdits 모드를 고려할 수 있어요. (출처: ccperm)
  > [ccperm] Only use this mode in isolated environments like containers or VMs where Claude Code can’t cause damage.
  > [ccperm] acceptEdits Automatically accepts file edits and common filesystem commands such as mkdir , touch , mv , and cp for paths in the working directory or additionalDirectories
- **"컨텍스트가 꽉 차서 compact할게요"** — 뜻: 대화를 요약본으로 압축한다는 뜻이에요. 대화 초반에 한 자세한 지시는 요약에서 사라질 수 있어요. / 확인할 것: 계속 지켜야 할 규칙이 있다면 CLAUDE.md에 적어 달라고 하세요. (출처: cchow)
  > [cchow] The summary keeps your requests and key code snippets, but detailed instructions from early in the conversation may be lost.
  > [cchow] Put persistent rules in CLAUDE.md rather than relying on conversation history.
- **"CLAUDE.md에 규칙을 추가할게요"** — 뜻: 다음 세션부터 Claude가 시작할 때 읽을 지침 파일에 내용을 적는다는 뜻이에요. / 확인할 것: CLAUDE.md는 강제 설정이 아니라 참고 자료예요. 한 파일은 200줄 아래를 목표로 하라고 문서가 권해요. (출처: ccmemory)
  > [ccmemory] Claude reads them at the start of every session.
  > [ccmemory] Claude treats CLAUDE.md files as context, not enforced configuration
  > [ccmemory] target under 200 lines per CLAUDE.md file.

## 출처 6건 (새로 등록)
| id | 제목 | URL |
|---|---|---|
| cchow | Claude Code · 작동 방식 | https://code.claude.com/docs/en/how-claude-code-works |
| ccmemory | Claude Code · 메모리와 CLAUDE.md | https://code.claude.com/docs/en/memory |
| claudectx | Claude · 컨텍스트 창 | https://platform.claude.com/docs/en/build-with-claude/context-windows |
| ccmcp | Claude Code · MCP | https://code.claude.com/docs/en/mcp |
| ccskills | Claude Code · 스킬 | https://code.claude.com/docs/en/skills |
| ccperm | Claude Code · 권한 | https://code.claude.com/docs/en/permissions |

모두 volatile: true (제품 문서라 자주 바뀜 → 90일 재확인 대상).

## 검토 메모 (초안 작성 에이전트 보고 + 내 대조)
- 근거를 못 찾아 뺀 것: 프롬프트 인젝션의 정의(경고만 있음), 모드별 기본 시작값(요금제·버전별 상이), 컨텍스트 창 크기 숫자, MCP 서버 보안 점검 방법.
- 내가 고친 것 3곳: "세션 하나는 대화 하나예요"(근거 없음) 삭제, "프로젝트 스킬은 커밋하면 팀원도 받아요" → "저장소에 커밋해 둘 수 있어요"(원문은 commit까지만), 번역기 같은 문구 동일 수정. "Pending approval"·웹 가져오기 영구 저장 규칙은 원문 인용을 추가로 붙임.
- 주의: 권한 문서에서 default 모드는 화면에 Manual로 표시됨.