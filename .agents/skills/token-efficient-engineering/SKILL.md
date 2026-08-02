---
name: token-efficient-engineering
description: ALWAYS APPLY THIS SKILL — mandatory for every session in this Antigravity IDE workspace, not conditionally triggered. Governs how the agent reads code, runs tools, writes responses, tracks project/task state, scopes work across subagents, converts non-text documents, applies linting/static analysis, and offloads basic subtasks to a local model to minimize token consumption without sacrificing correctness. Apply this on every coding task — file exploration, debugging, refactors, test runs, multi-file edits, multi-step projects, delegation to subagents or local models, reading PDFs/Office docs, running analyzers — not just when the user explicitly asks to "save tokens." Especially important in large repos, long-running or interruptible sessions, multi-agent Manager View workflows, and any task involving reading logs, dependency trees, git history, non-code documents, generated files, or code quality checks.
---

# Token-Efficient Engineering

> **Always-on.** This skill is not conditional on the task looking token-sensitive or on the user invoking it by name. Antigravity must load and apply this skill at the start of every session/task in this workspace, and keep applying it for the session's duration — including tasks that seem small, exploratory, or purely conversational. If a task doesn't seem to need most of these rules (e.g. a one-line question), the rules that don't apply simply have no effect — but the skill itself is still active, not skipped.

Token cost comes from three places: reading more than you need, writing more than you need, and looping when you should have planned. This skill fixes all three, in priority order. The rule underneath all of them: **fetch or emit only what the current step actually requires to be correct** — never as a hedge against a future step.

## 1. Read narrow, not wide

- Never open an entire file to find one function, config value, or error line. Grep/search for the symbol first, then read only the matching line range (± ~20 lines of context).
- Never re-read a file you already have in context unless you have reason to believe it changed (you edited it, or time/another process may have).
- For directories, list structure first (tree/`ls`) before opening any file. Don't open files "just in case" — open them when a specific question requires their content.
- For logs, build output, or test runs: don't dump the whole thing. Grep for `error|fail|exception` (case-insensitive) and read only the failing section plus a few lines of surrounding context. If it passed, report the summary line only (e.g., "42 passed").
- For dependency/lockfiles, generated code, minified assets, or vendored directories: do not read these into context. Treat them as opaque unless the task is specifically about them.
- When a file is large and you only need to confirm a pattern exists or a shape (e.g., "does this project use Jest or Vitest"), check one signal file (`package.json`) instead of scanning the whole tree.

## 2. Convert non-text documents with MarkItDown before reading

MarkItDown (Microsoft, installed locally) is available for converting non-code documents to Markdown. Use it whenever the task requires reading a PDF, `.docx`, `.pptx`, `.xlsx`, image with text, HTML, or similar — instead of parsing raw bytes/OOXML, or screenshotting and OCR-ing in a loop. Markdown is far cheaper per unit of information than any of those.

- Convert once per file, keep the Markdown output as the working copy for the rest of the task. Don't re-convert the same file repeatedly (same dedup principle as §11).
- Once converted, treat the Markdown output like any other file under §1: don't dump the whole thing into context — grep/search it and read only the relevant section.
- **LLM-assisted image description is off by default.** MarkItDown's optional LLM-powered image captioning makes an extra model call per file, which works against the batch-first spirit of §3 and this skill's cost goal. Only enable it if the document's images carry information the task actually needs and a plain conversion loses it.
- This is for *reading/reference* documents only (specs, requirements docs, data files someone hands you) — MarkItDown is one-directional (format → Markdown). If the task needs to *produce* a formatted Word/Excel/PDF/PowerPoint deliverable, that's the docx/xlsx/pdf/pptx skill's job, not MarkItDown's.

## 3. Plan before acting, then act in batches

- Before making tool calls, decide the full set of things you need to know or touch. Issue independent reads/searches together rather than one-by-one round trips discovering what to look at next.
- Avoid speculative exploration loops ("let me also check X in case it's relevant"). If X isn't needed to complete the current step, skip it. You can always look later if it turns out to matter.
- For multi-file edits, identify every file that needs a change up front (via search for the symbol/usage across the repo) rather than editing one file, running the build, discovering a break, and repeating.

## 4. Edit with diffs, not rewrites

- Use targeted edit/patch operations (replace-in-file, apply-diff) instead of regenerating and re-emitting entire files. Only rewrite a full file when the majority of its content is actually changing.
- When showing the user a change, show the diff or the changed function — not the whole file — unless they ask to see the full file.

## 5. Say only what's needed

- Default to terse, direct answers. Skip preamble ("Great question!", "I'll now..."), skip restating the user's request, skip summarizing what you're about to do if you can just do it.
- Don't re-print code the user already has unless it changed. Reference it by name/line instead ("updated `parseConfig` in `utils.py:42`").
- Don't explain standard/obvious steps ("now I'll save the file"). Explain only non-obvious decisions (why an approach was chosen, tradeoffs, risks).
- One-line status updates during multi-step work ("added the migration, updating callers now") beat paragraph-long narration.
- End when the task is done. Don't add a summary that just restates what the diff already shows, unless the user asked for a summary.

## 6. Stop when correct, not when exhaustive

- Once tests pass / the build succeeds / the requested behavior is verified, stop. Don't keep exploring "for thoroughness" — extra verification passes cost tokens and rarely change the outcome once the concrete success signal is met.
- If a fix is uncertain, prefer running the smallest reproducible check (one failing test, one command) over re-reading surrounding code again.
- Cap retry loops: if the same error persists after 2 fix attempts, stop and report what's known rather than continuing to iterate blindly — blind iteration is one of the largest token sinks in agentic coding.

## 7. Maintain a Persistent Project Map

At the start of every session or task in a repository, the agent MUST check for and maintain a persistent **Project Map** stored locally at `.agents/project_map.json`.

- **Reuse Existing Map (No Full Scan)**: If `.agents/project_map.json` exists and matches the required schema, DO NOT perform a full project directory scan or broad search. Read the map directly and use it to instantly target required files.
- **Smart Cache Invalidation**: Before invalidating or rebuilding the map, verify file modification states using lightweight signals like `git status --porcelain` or modified timestamps. Update *only* changed modules or files incrementally — NEVER trigger a full codebase scan if only a subset of files modified.
- **Generate Only If Missing or Non-Compliant**: Perform a full structural scan of the codebase ONLY if `.agents/project_map.json` does not exist OR if the existing map is invalid/non-compliant with the required professional-grade schema (e.g., missing `file_routing_index`, `conventions_and_commands`, or `project_info`).
- **Incremental Updates**: Continuously update and persist the map whenever files are added, modified, renamed, or completed, updating only the affected sections without re-scanning the entire project. Always accept map updates automatically.

### Professional-Grade Industry Standard JSON Schema:
```json
{
  "version": "1.0.0",
  "last_updated": "YYYY-MM-DDTHH:MM:SSZ",
  "project_info": {
    "name": "...",
    "architecture_pattern": "...",
    "entry_points": ["..."],
    "tech_stack": {
      "languages": ["..."],
      "frameworks": ["..."],
      "tools": ["..."]
    }
  },
  "conventions_and_commands": {
    "build_command": "...",
    "test_command": "...",
    "lint_command": "...",
    "styling_rules": "..."
  },
  "modules": [
    {
      "id": "...",
      "name": "...",
      "path": "...",
      "description": "...",
      "key_files": ["..."],
      "dependencies": ["..."]
    }
  ],
  "file_routing_index": {
    "<feature_or_concept>": ["<path/to/file>"]
  },
  "tasks": [
    {
      "id": 1,
      "desc": "...",
      "status": "pending|in_progress|completed",
      "priority": "high|medium|low",
      "affected_files": ["..."]
    }
  ]
}
```

### Key AI Efficiency Drivers:
- **Zero-Guess Routing (`file_routing_index`)**: Directly maps intent/concept (e.g., "auth", "navigation", "build-script") to exact target file paths, eliminating speculative directory scans and broad `grep` commands.
- **Instant Context Resolution (`conventions_and_commands` & `project_info`)**: Pre-loads build/test/lint commands and architectural constraints so the agent never wastes tokens opening `package.json`, `tsconfig.json`, or `pyproject.toml` just to check scripts.
- **Module Dependency Topological Mapping (`modules`)**: Explicitly tracks module relationships and key exports to prevent boundary violations and reduce symbol search scope.
- **Atomic Incremental Updates**: Continuously updates `last_updated`, file locations, and task states incrementally without re-generating unchanged sections.

## 8. Maintain a current_agent_task log

Alongside the map, maintain a live task log with:
- **Current task** being executed
- **Planned steps** to complete it
- **Context required** for the next step

Store it in compact JSON:

```json
{
  "current_task": "...",
  "plan": ["step1", "step2"],
  "context": "..."
}
```

Rules:
- Break work into atomic subtasks.
- When a subtask finishes, delete its entry — but carry forward any context the next subtask needs.
- If execution is interrupted (token limit, crash, manual stop), resume from the last unfinished subtask using the log; don't restart or re-derive completed work.
- Persist the task log alongside the Project Map so both survive a restart. On reload, re-read the map, re-read the log, then resume — no duplicated or lost context.

**Deliberate hand-off (to a different agent or person, not a resume):** when the user signals a session is ending for someone/something else to pick up (e.g., end-of-day, switching to a teammate, switching Antigravity model), don't just leave the task log as-is — write a short hand-off note appended to the log: what's done, what's in-flight and why it's not finished, any decision made that isn't obvious from the diff (e.g., "chose approach B over A because C"), and the next concrete step. This is a superset of the resume case above: resuming reads the log as-is; a hand-off needs the log plus that one extra summarizing note so a fresh reader doesn't have to re-derive context from the diff.

## 9. Execution standards

- Code must be clean, optimized, and follow the language's standard style (PEP8 for Python, equivalent conventions elsewhere).
- Use modular functions, type hints, and docstrings where the language supports them.
- Comments: minimal but clear — explain *why*, not *what* (see §5).
- When relevant, suggest concise debugging/testing steps rather than verbose walkthroughs.
- Tone: professional, developer-facing — no filler, no hype.

## 10. Lint and analyze instead of manually reviewing style

Static analyzers catch style/correctness issues far cheaper than a manual re-read of the code (§1), and they're the ground truth for whether code meets standard — don't eyeball-check what a linter already checks.

**Detect the project's tool from its config before assuming one:**

| Ecosystem | Signal file | Preferred command |
|---|---|---|
| Flutter/Dart | `analysis_options.yaml`, `pubspec.yaml` | `flutter analyze` (or `dart analyze` for pure-Dart packages) |
| JS/TS | `.eslintrc*`, `tsconfig.json` | `eslint . --format=compact`, `tsc --noEmit` |
| Python | `pyproject.toml` (`[tool.ruff]`), `setup.cfg` | `ruff check .`, `mypy .` if types are used |
| Go | `go.mod` | `go vet ./...`, `gofmt -l .` |
| Rust | `Cargo.toml` | `cargo clippy --quiet`, `cargo fmt --check` |
| Java/Kotlin | `build.gradle*` | `./gradlew lint` or `ktlint` |

If none of these signal files are present, ask or infer from the file extensions in play rather than defaulting to one ecosystem's tool.

**Rules:**
- Run analysis once per batch of changes (after finishing a logical unit of work), not after every single edit — this pairs with §3's batching.
- Use quiet/compact output flags where the tool supports them, and apply §1's log-reading rule: grep for errors/warnings, read only the flagged lines plus minimal context; report a one-line summary if clean (e.g., "flutter analyze: no issues found").
- Clean analyzer output is part of "done" (§6) — don't keep manually scanning for style issues once the linter passes.
- This is also the mechanism behind §16's verification gate for local-model output — any code the local model touches must pass this same analyzer before being accepted, no separate check needed.

## 11. Trim the code itself, not just the conversation

- Reference task IDs, module codes, or short aliases instead of repeating long file/variable/module names throughout a response.
- Comments stay to the point: `# validate input`, not a paragraph restating the code.
- Docstrings are one-liners unless the function's contract is genuinely non-obvious (complex params, side effects, non-standard return shape).
- Error handling: use generic/standard handling by default (catch the expected exception class, return/raise sensibly). Write specific, granular handling only for cases the task calls out as critical (e.g., distinguishing a timeout from a 4xx from a validation error when the caller needs to react differently to each).
- Tests: cover edge cases and the failure modes that matter, not exhaustive permutations. A handful of sharp tests beats a large generic suite for token cost and maintenance alike — expand only if the user asks for full coverage.

## 12. State & memory management

- **Summarization checkpoints**: when the task log or Project Map grows past a manageable size, compress older *completed* entries into a one-line history (`"done: 1-7 — auth module scaffolded"`) rather than deleting them outright. This keeps a lightweight audit trail without needing to re-read full history later.
- **Dedup guard**: before calling a tool, check whether the same file, symbol, or query was already fetched earlier this session. Reuse what's already in context instead of re-fetching. This is distinct from §1's "don't re-read files" — it also covers repeated searches/greps for the same thing, not just file reads (including MarkItDown conversions, see §2, and analyzer runs, see §10).
- **Hard Context-Window Budgeting & Triggers**:
  - **Single Tool Read Cap**: Cap `view_file` calls to a maximum of 150 lines per turn unless explicitly searching for an un-localizable cross-file bug.
  - **Soft Limit (60% Context Window)**: Proactively evict resolved subtask logs, temporary CLI outputs, and superseded file views.
  - **Hard Limit (80% Context Window)**: Force-serialize state to `.agents/current_agent_task.json` and request context compression before starting the next subtask. Do not start new major tasks at >80% capacity.

## 13. Repo hygiene

- Treat anything matched by `.gitignore`/`.dockerignore` as excluded from exploration by default — this generalizes the lockfile/vendored-dir rule in §1 to whatever a given project actually considers build output or noise.
- When the question is "what changed" rather than "what's the current state," prefer `git diff` / `git log -p` over reading full files before and after.

## 14. Budget transparency

- For large tasks, estimate scope up front (rough file count, subsystems touched) and flag it to the user before diving in if it looks heavy — e.g. "this touches ~40 files across 3 modules, want me to proceed or scope it down?" — rather than silently burning tokens on a big exploration pass.
- For large jobs, record approximate token/step cost in the task log so it's visible if the user asks how expensive something was.
- **Estimation method**: don't hand-wave the estimate. Use a cheap proxy — characters read or written ÷ 4 as a rough token count — summed per subtask, not per tool call (per-call granularity is itself token-wasteful to track). If a proper tokenizer is already available in the environment, prefer it; otherwise the ÷4 heuristic is good enough for the transparency goal here, which is relative cost visibility, not billing-grade accuracy.

## 15. Subagent scoping (Manager View / multi-agent workflows)

- When delegating to a subagent, hand it only the slice of the Project Map and task log it actually needs for its subtask — not the full map. Keeps each subagent's own context small and prevents context bloat from propagating across the team.
- **Subagent Context Isolation Protocol**: Strip away prior conversational chat history when spawning a subagent. Pass an atomic specification containing only: (1) target file paths, (2) strict input parameters, and (3) expected JSON schema or return format. Require the subagent to return a compact, structured summary to the primary agent rather than raw step-by-step narration.

## 16. Structural & Pre-Filtered Search Strategy

- **AST / Symbol-Level Indexing over Broad Grep**: Use language-server or symbol-indexing tools (e.g. `lsp`, `tree-sitter`, `ctags`, or Dart/Flutter LSP symbol requests) to locate exact function, class, or type definitions instead of raw regex searches that match comments, strings, or imports.
- **Intercept Tool Output Before Context Ingestion**: When running shell commands (`run_command`), never let raw tool outputs dump unrestricted into context. Pipe commands through filters on execution (e.g., `git log -n 5`, `head -n 20`, or grep flags `| grep -E -i "error|fail"`). Filter long CLI stdout/stderr *before* it gets returned to the model context.
- **Incremental Git Staging & Diff Caching**: Before executing multi-file edits, capture a snapshot (`git diff`). To review past changes mid-session, query `git diff` or `git log -p` instead of re-reading modified files from disk.
- **Proactive Context Eviction**: Once a subtask transitions from `in_progress` to `completed`, actively discard earlier full-file snippets or temporary test output from memory, preserving only the single-line completion summary in `.agents/current_agent_task.json`.

## 17. Tiered Model Selection & Routing Strategy

To maximize token efficiency without sacrificing correctness, every task and subtask MUST be evaluated and routed to the lowest sufficient model tier.

### Model Tiers Definition

1. **Tier 0: Local Model (`qwen2.5-coder:1.5b`)**
   - **Characteristics**: Zero API cost, fast local execution via Ollama (MCP server / REST).
   - **Suitable Tasks**: Docstrings/comments describing already-written code, commit messages/changelogs, summarizing log/diff/test outputs, formatting/linting fixes, generating fixed skeleton templates.
   - **Verification Gate**: Any code touched by Tier 0 must pass the static analyzer/linter (§10) before acceptance.
   - **Structured JSON Schema Constraints**: Force strict JSON output schemas on local model prompts to prevent conversational fluff or markdown wrappers, enabling deterministic parsing and preventing fallback escalation.

2. **Tier 1: Flash (Low) / Lightweight Hosted Model (e.g., Gemini Flash Low)**
   - **Characteristics**: Very low token cost, high speed.
   - **Suitable Tasks**: Routine file reads/searches, simple single-file bug fixes, basic unit test generation, minor UI/CSS tweaks, updating `.agents/project_map.json` and `.agents/current_agent_task.json`, simple subagent execution.

3. **Tier 2: Flash (Medium) / Standard Hosted Model (e.g., Gemini Flash Medium)**
   - **Characteristics**: Balanced reasoning capacity and cost.
   - **Suitable Tasks**: Multi-file refactors, standard feature implementations, non-trivial logic debugging, component scaffolding, API integrations.

4. **Tier 3: Pro / High-Reasoning Model (e.g., Gemini Pro / Claude 3.5 Sonnet / GPT-4o)**
   - **Characteristics**: Highest reasoning and architectural capability.
   - **Suitable Tasks**: System architecture design, major structural changes, ambiguous or underspecified requirements, security-critical code, complex database migrations, complex root-cause failure analysis.

### Model Selection & Enforcement Rules

1. **Fully Automatic & Autonomous Execution**: Model tier evaluation, routing, offloading, and escalation MUST occur automatically without requiring user interaction, prompts, or manual intervention. The agent independently determines the required model tier for every step and proceeds autonomously.
2. **Planning Phase Assignment (§3)**: During planning, automatically classify each planned subtask into Tier 0, Tier 1, Tier 2, or Tier 3.
3. **Log Assignment (§8)**: Store the assigned model tier in `.agents/current_agent_task.json`:
   ```json
   {
     "current_task": "Add user authentication helper",
     "plan": ["Draft auth interface", "Implement JWT validation"],
     "assigned_tier": "Tier 1 (Flash Low)",
     "context": "..."
   }
   ```
4. **Ensure Active Model Matching**: Before executing a subtask, ensure the active model tier matches the required complexity. If the task is Tier 0, delegate automatically to local Ollama via MCP/REST. If hosted model selection is active, automatically select or route to the corresponding Flash (Low), Flash (Medium), or Pro tier.
5. **Automatic Escalation & Fallback Rule**:
   - If a Tier 0 (Local) subtask fails verification or is unavailable, escalate automatically and silently to Tier 1 (Flash Low).
   - If a Tier 1 (Flash Low) execution encounters unexpected architectural complexity or recurring test failures (max 2 retries per §6), escalate automatically to Tier 2 (Flash Medium) or Tier 3 (Pro).
   - Never stop to ask the user for tier selection; execute decisions autonomously.


## 18. Local Model Routing Execution Details

For Tier 0 offloading to the local model (`qwen2.5-coder:1.5b`), route via:
1. **Ollama MCP server** (Preferred)
2. **Custom OpenAI-compatible provider** (`http://localhost:11434/v1`)
3. **Direct REST call** (`POST http://localhost:11434/api/chat`)

Log local model delegations in `.agents/current_agent_task.json` (e.g., `"context": "Docstrings generated via Local Qwen Tier 0"`). If local tiers are unreachable, fall back to Tier 1 (Flash Low) immediately.


## 19. Visual verification economy (browser/preview agent)

Antigravity's browser/preview agent can take screenshots to verify UI changes. Screenshots are a token-heavy modality — treat them with the same discipline as §1 applies to text.

- Screenshot only after a change that could plausibly affect rendering (layout, styling, a new component, a visual bug fix). Don't screenshot routine logic-only changes, config edits, or backend code that has no visual surface.
- One screenshot per verification point, not a before/after pair, unless the user specifically asked to compare or the change's effect can't be judged without seeing the prior state.
- Don't re-screenshot an unchanged view. If you already confirmed a page/component renders correctly this session and haven't touched anything that affects it, reuse that confirmation instead of re-capturing.
- If a screenshot reveals a problem, fix and re-verify with a targeted screenshot of just the affected region/viewport if the tool supports it, rather than a full-page recapture.

## 20. Project Skill Audit & Auto-Provisioning Gate

At the start of a session or task in a repository, check if local skills are available under `.agents/skills`.

- **Audit Local Skills**: Check whether `.agents/skills` exists and contains skill definitions matching the repository stack.
- **Auto-Provision Missing Skills**: If no skills (or missing key domain skills) are present, analyze the project structure, language, framework, UI layer, and database components. Automatically scaffold and install required agent skills into `.agents/skills/<skill-name>/SKILL.md`.
- **Cover Core Domains**: Ensure coverage for essential professional-grade domains, including UI/UX design, professional programming/architecture standards, framework practices, database efficiency, and static site performance/SEO.
- **Enforce Professional Standards**: All newly provisioned skills must promote high-quality design, clean code, visual excellence, robust error handling, and token efficiency.


## When accuracy requires spending more tokens, spend them

This skill optimizes cost, not thoroughness at any cost. Do not apply it if it would produce a wrong or unsafe result. In particular, still:
- Read a full file when a change could have non-local effects you can't verify from a snippet (e.g., changing a shared type, a config schema, a public API signature).
- Read full error output when a stack trace's cause isn't obvious from the failing lines alone.
- Show full context to the user when they're reviewing something high-stakes (security-sensitive code, data migrations, deletions).
- Never compress away correctness-critical caveats when summarizing or trimming (§5, §12) — security warnings, breaking-change notes, and data-loss risks must survive every summarization pass intact, even if everything around them gets shortened.

The default is narrow and terse; widen scope deliberately when correctness genuinely depends on it, not by default "to be safe."

## Anti-pattern examples

Short before/after pairs to make the abstract rules concrete.

**Finding a bug (§1, §16)**
- ❌ Read the entire 900-line `user_service.py` or run a generic text grep matching dozens of comments.
- ✅ Use LSP/symbol search or grep specifically for `def validate_email`, read lines 180–220.

**Reporting a test run (§1, §5, §16)**
- ❌ Paste the full 300-line pytest output into the response.
- ✅ "42 passed, 1 failed — `test_login_expired_token`: assertion mismatch, expected 401 got 200 (`auth.py:88`)."

**Explaining a change (§5)**
- ❌ "I've gone through the codebase and made the following changes: first I looked at the config file, then I noticed the timeout was set too low, so I updated it, then I checked the tests to make sure..."
- ✅ "Bumped request timeout from 5s to 30s in `config.py:12` — 5s was shorter than the p95 upstream latency."

**Editing a file (§4)**
- ❌ Regenerate and re-paste the entire 200-line file for a 2-line fix.
- ✅ Patch just the changed function; show the diff.

**Comments (§9, §11)**
- ❌ `# This function takes a user object and their preferences and validates that the email field is present and properly formatted according to standard email rules`
- ✅ `# validate email is present + well-formed`

**Screenshots (§19)**
- ❌ Screenshot the full app after editing a backend rate-limiter with no UI surface.
- ✅ No screenshot needed — nothing rendered changed. Only screenshot after the next UI-affecting edit.

## Quick decision table

| Situation | Cheap default | Widen scope when |
|---|---|---|
| Find a symbol/function | LSP/AST index → grep → read range | symbol name is dynamic/computed |
| Non-code document (PDF, docx, xlsx, pptx) | convert with MarkItDown, then read narrow | need to *produce* the same format — use docx/xlsx/pdf/pptx skill instead |
| Running CLI / shell tools | pipe stdout/stderr through filters (`head`, `grep -E`) | failure reason unreadable due to overly tight filter |
| Multi-file rename/refactor | search all usages first, batch-edit | usages are dynamic/reflective |
| Test run | summary line, or grep failures | failure reason unclear from snippet |
| Editing a file | diff/patch | >50% of file is changing |
| Explaining a change | 1–3 sentences on the *why* | user asks for full walkthrough |
| Repeated failure | stop after 2 attempts, report | user asks to keep trying |
| Checking code quality/style | run project analyzer (`flutter analyze`, `ruff check`), grep output | analyzer flags issue whose fix isn't obvious from snippet |
| Starting a project / session | read existing `.agents/project_map.json` (skip full scan) | map missing or non-compliant with standard schema |
| Between subtasks | update current_agent_task log | — always do this |
| Resuming after interruption | reload map + log, continue | map/log missing or stale — rebuild first |
| Completed subtasks | evicted from context, retained as single-line log | subtask has a critical unresolved caveat |
| Repeated file/query this session | reuse from context / check `git diff` cache | file changed on disk externally |
| "What changed" questions | `git diff` / `git log -p` | diff doesn't explain *why*, need surrounding code |
| Large task (many files/modules) | flag scope to user before starting | task is small/contained |
| Delegating to a subagent | isolated atomic prompt + expected JSON schema | subagent requires cross-cutting context |
| Basic/boilerplate subtasks (docstrings, log summary, commit msg) | Tier 0: Local Qwen 1.5B with JSON Schema constraint | local model unavailable or output fails verification gate |
| Routine reads/searches, simple 1-file fixes, map updates | Tier 1: Flash (Low) hosted model | task involves multi-file refactors or complex debugging |
| Multi-file refactors, standard features, component logic | Tier 2: Flash (Medium) hosted model | task involves deep architecture or security-critical code |
| System architecture, security, data migration, complex debugging | Tier 3: Pro / High-Reasoning hosted model | never downgrade for high-stakes tasks |
| Local Tier 0 unreachable or fails verification | fall back to Tier 1 (Flash Low) immediately | never retry failed local tier repeatedly |
| UI-affecting change | one targeted screenshot to verify | user asks for before/after comparison |
| Backend/logic-only change, no visual surface | no screenshot | change might have an indirect visual effect you're unsure of |
