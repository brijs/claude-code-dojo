# Claude Code Dojo

An interactive, narrated, retro-terminal explainer: **Claude Code Dojo with Sensei Shell**.
22 hands-on lessons on using Claude Code well: context, settings, permissions, CLAUDE.md,
shortcuts, prompting, subagents, parallel sessions and worktrees, notifications, and a
starter setup. Finish the final trial (6 of 8) to earn the black belt.

Everything ships as one self-contained HTML file with the narration embedded, so no server is needed.

## Try it

Open `dist/claude-code-dojo.html` in a browser and press **enter the dojo**. Click once on the page if audio doesn't start (browsers block autoplay until you interact).

## Build it yourself

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install kokoro-onnx soundfile playwright && playwright install chromium
brew install ffmpeg
# Kokoro models (~350 MB) in ~/.cache/kokoro (or set KOKORO_DIR):
#   kokoro-v1.0.onnx and voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx releases
python3 tts.py && python3 build.py && python3 test.py
```

- `narration.json` holds one narration entry per scene; `tts.py` renders only changed scenes (voice: Kokoro `af_heart`).
- `parts/` holds the CSS, engine and scene scripts; `build.py` concatenates them into `dist/`.
- `test.py` walks every scene in Playwright and reports JS errors (`PW_CHANNEL=chrome` uses installed Chrome).
- `storyboard.md` lists the scenes; `.claude/skills/animated-explainer-builder/` is a reusable skill for other topics.

## Accuracy

Commands and shortcuts come from the official [Claude Code docs](https://code.claude.com/docs) as of October 2026. Claude Code changes quickly, so re-verify before relying on them.

## Credits

Made by Brijesh Shetty ([github.com/brijs](https://github.com/brijs)) with Claude Code. Narration voice by [Kokoro](https://github.com/hexgrad/kokoro) via kokoro-onnx. MIT licensed.
