# Storyboard: "Claude Code Dojo with Sensei Shell"

**Style:** Terminal / retro CRT (phosphor green and amber, scanlines, monospace)
**Guide:** Sensei Shell, a calm CRT-headed mentor. His headband changes colour as you rank up (white to black).
**Format:** Deep dive. 22 scenes, about 28 minutes with narration. Lessons run in the order below.
**Voice:** Kokoro "Heart" (af_heart), pre-rendered and embedded in the page.

| # | Belt | Scene | What you do | Takeaway |
|---|------|-------|-------------|----------|
| 0 | White | Welcome to the dojo | Bow and enter | Roadmap of 16 lessons |
| 1 | White | The one rule: context | Feed the context meter, then clear, compact or use /btw | Context is the scarce resource |
| 2 | Yellow | Settings layers | Click the 5-layer ladder, sort 3 scenarios | managed > CLI > local > project > user; lists merge; check with /status |
| 3 | Yellow | Permission modes | Cycle Shift+Tab, try 3 actions in each mode | Manual, accept edits, plan, auto; allow/deny rules |
| 4 | Orange | Model and effort | Drag a task-difficulty slider | Option+P, /effort, Option+O; match effort to task |
| 5 | Orange | CLAUDE.md | Keep/cut 8 lines | Short, specific, under 200 lines |
| 6 | Green | Memory map | Click a file tree | /init, @imports, .claude/rules with paths, auto memory, hooks for guarantees |
| 7 | Green | Shortcut dojo | Press the real keys | Esc, Esc Esc, Shift+Tab, Ctrl+G, Ctrl+R, Ctrl+B, Ctrl+O, Ctrl+S |
| 8 | Blue | Slash command deck | Filter and flip cards | /clear, /compact, /rewind, /btw, /context, /diff, /doctor and more |
| 9 | Blue | Prompting | Sharpen vague prompts | Verify, scope, patterns, symptoms; @ files, images, pipes |
| 10 | Brown | Explore, plan, implement, commit | Step through the flow, then size a task | Plan mode, Ctrl+G, skip the plan for one-line diffs |
| 11 | Brown | Failure patterns | Choose the fix for 5 symptoms | Clear, scope, prune, verify |
| 12 | Brown | Power tools | Match needs to hooks, skills, subagents, MCP, plugins | Right tool for each job |
| 13 | Brown | Scale up | Toggle worktrees, writer/reviewer, headless, /batch | Parallel and unattended runs |
| 16 | Brown | Where are my sessions? | Widen a mock /resume picker, press the left arrow | Picker scope: worktree, Ctrl+W repo, Ctrl+A all, Ctrl+B branch. Left arrow = agent view (background sessions, all projects) |
| 17 | Brown | Parallel features: one worktree each | Start, edit and exit two worktree sessions | claude --worktree <name>, .claude/worktrees, auto cleanup, .worktreeinclude, baseRef |
| 18 | Brown | Side quests, forks, in-flight keys | Match 6 situations to /btw, /branch, /fork, /rewind, /clear, queueing | Enter queues, Ctrl+Enter sends now, /tasks, Ctrl+B, Ctrl+T, Ctrl+X Ctrl+K |
| 19 | Brown | Terminal setup: keys, alerts, file views | Pick terminal, build a notification config | Option as Meta, /terminal-setup, terminal_bell, Notification hook, /diff, Ctrl+O, Ctrl+G |
| 20 | Brown | Context in practice: subagents | Toggle which steps of a 3-module feature to delegate | Subagents return summaries; interview, spec, fan-out, implement, review |
| 21 | Brown | A good starter setup | Toggle settings pieces, copy files | allow/deny rules, notifications, global vs project CLAUDE.md, .gitignore, /doctor |
| 14 | Brown | Playground | Type into a mock terminal | Practice the moves safely |
| 15 | Black | Final trial | 8-question quiz (pass 6) and a cheat sheet | Copy the cheat sheet |

Facts are taken from the current official Claude Code docs (interactive mode, settings, memory, best practices).
