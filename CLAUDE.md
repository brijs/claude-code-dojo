# Claude Code Dojo (animated explainer)

Interactive, Kokoro-narrated explainer "Claude Code Dojo with Sensei Shell": 22 lessons on productive Claude Code use. Single-file HTML output with narration embedded as base64 MP3.

## Layout
- `narration.json`  one caption/narration entry per scene (s0..s21); edit text here
- `tts.py`          renders `audio/<scene>.<hash>.mp3` with Kokoro af_heart; cached by hash, only changed scenes re-render
- `parts/`          `a_head.html` (CSS + shell), `b_engine.js` (Sensei SVG, audio, captions, nav), `c/d/e_scenes*.js` (scenes 0-15) and `f_scenes_parallel.js` (scenes 16-21: sessions, worktrees, detours, terminal/alerts, subagent context, starter setup). Lesson order is set by the ORDER list at the bottom of `f_scenes_parallel.js` (s16-s21 sit between s13 and s14)
- `build.py`        concatenates parts + injects NARR/AUDIO -> `dist/claude-code-dojo.html`
- `test.py`         Playwright walkthrough of every scene, reports JS errors, screenshots to /tmp
- `storyboard.md`   scene table
- `.claude/skills/animated-explainer-builder/` reusable skill for other topics

## Workflow
1. Setup once: `python3 -m venv .venv && . .venv/bin/activate && pip install kokoro-onnx soundfile playwright && playwright install chromium`; `brew install ffmpeg`.
2. Kokoro models (~350 MB) go in `~/.cache/kokoro` (or set KOKORO_DIR): kokoro-v1.0.onnx and voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx releases (model-files-v1.0).
3. Edit narration or scenes, then `python3 tts.py && python3 build.py && python3 test.py`. `tts.py` needs `ffmpeg` on PATH (it deletes a scene's old mp3 before encoding, so a failed run leaves that scene without audio; just rerun). `test.py` uses Playwright Chromium, or set `PW_CHANNEL=chrome` to use installed Chrome.
4. Open `dist/claude-code-dojo.html`.

## Decisions
- Style: terminal / retro CRT. Guide: Sensei Shell (belt = progress, black belt via final quiz >= 6/8).
- Voice: Kokoro Heart (af_heart) only; no browser speech.
- Facts come from the official Claude Code docs (interactive mode, settings, memory, best practices) as of Oct 2026; re-verify shortcuts/commands before publishing.
- Hosting: GitHub Pages at https://brijs.github.io/claude-code-dojo/ (repo github.com/brijs/claude-code-dojo, serves `docs/index.html` from main; `build.py` writes it, so commit `docs/` after rebuilding). Credit github.com/brijs alongside Brijesh Shetty.
