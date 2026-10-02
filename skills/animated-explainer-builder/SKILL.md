---
name: animated-explainer-builder
description: Build an animated, interactive, Kokoro-narrated single-file HTML explainer with a guide character and storyboard-first workflow, for any topic. Works in Claude Cowork and Claude Code.
---

# Animated explainer builder

Use when the user wants an animated, interactive, voiced explainer on a topic (a book, a tool, a concept). Output is ONE self-contained .html file with narration embedded as base64 MP3.

## 0. Detect the environment first

Run these checks once and adapt; never assume a particular sandbox.

```bash
python3 --version; which ffmpeg; pip --version
python3 -c "import playwright" 2>&1 | head -1; ls /opt/pw-browsers 2>/dev/null
ls /mnt/user-data/outputs 2>/dev/null && echo COWORK_OUTPUTS
```

- **Work dir**: a folder named `explainer-<topic-slug>/` in the current project (Claude Code) or the session working directory (Cowork). Keep `narration.json`, `tts.py`, `build.py`, `parts/`, `audio/` there.
- **Output dir**: `/mnt/user-data/outputs/` if it exists (Cowork: files written there with Write/Edit are delivered; otherwise call the file-delivery tool). Else write the final HTML into the project root (or `./dist/`) and tell the user the path. Do not hardcode either.
- **Python packages**: in a managed system Python (Cowork sandbox) add `--break-system-packages`. On a user machine, create a venv first: `python3 -m venv .venv && . .venv/bin/activate`, then `pip install kokoro-onnx soundfile`.
- **ffmpeg**: if missing, install it (`brew install ffmpeg`, `apt-get install -y ffmpeg`) or ask the user to; do not skip, MP3 compression keeps the file small. A WAV fallback is allowed only for very short explainers.
- **Browser testing**: use whatever exists. In this order: preinstalled Chromium at `/opt/pw-browsers` (do NOT run `playwright install` there); an existing Playwright install; otherwise `pip install playwright && playwright install chromium` (on a user machine this is fine and expected). If no browser can run, say so, and at least run `node --check` on the extracted script and describe what was not tested.
- **Questions tool**: use AskUserQuestion if available; otherwise ask the same questions as a short plain-text numbered list and wait.

## 1. Workflow (do in order)

1. **Ask up front** (one call, max 4 questions): visual style (4 distinct options themed to the topic), guide character (4 options with personality), scope (multi-select topics), format/length (short ~5 scenes, guided ~8-10, deep dive ~12-16, free-explore hub). Voice: default to Kokoro `af_heart` (Heart). Only ask about voice if the user has not already chosen Kokoro; never use the browser's default speech voices unless asked.
2. **Research first.** Gather facts from primary sources (official docs via WebFetch or the web tool) before writing anything. Never invent features, shortcuts or numbers. Mark illustrative numbers as illustrative in the UI. If no web access, use only what the user supplied and flag unverified claims.
3. **Storyboard first.** Write a scene table (# / level / scene / what the learner does / takeaway) to a .md file and show it. Each scene needs a concrete interaction (click, sort, drag, press real keys, type in a mock terminal, quiz). Include a welcome scene, a free-play scene, and a final quiz with a takeaway artifact (cheat sheet). If the user is clearly away or already chose options, proceed after delivering the storyboard; otherwise pause for changes.
4. **Narration script** in `narration.json`: one entry per scene, 35-60 spoken words, one idea per scene, second person, character voice. Write caption text with real syntax (`/clear`, `Shift+Tab`); the TTS step converts it to speakable text.
5. **Generate audio with Kokoro** (below). Cache by hash so edits re-render only changed clips.
6. **Build the HTML** from parts (head+css, engine.js, scenes*.js) with `build.py` that injects `NARR` and `AUDIO` JSON and writes the final file. Keep scene content in small `SCENES.push({id,belt,mood,title,html,init,onKey})` objects.
7. **Test** (see section 0 for what is available): load the file, click enter, step through every scene, exercise one interaction per scene, collect `pageerror` and console errors, screenshot at 1280x800 and 390x800, check `document.documentElement.scrollWidth <= innerWidth`. View at least 3 screenshots. Re-run the whole walkthrough after any fix.
8. **Deliver**: final HTML plus storyboard. One-line summary. Offer (do not do unasked) to publish: GitHub Pages, Cloudflare Pages, or an Artifact when available.

## 2. Kokoro TTS recipe

Model files are large (~325 MB + ~28 MB). Cache them outside the project, e.g. `~/.cache/kokoro/` (or `/tmp/kk` in a throwaway sandbox), and reuse on later runs.

```bash
K=${KOKORO_DIR:-$HOME/.cache/kokoro}; mkdir -p "$K"; cd "$K"
[ -f kokoro-v1.0.onnx ] || curl -sSL -O https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
[ -f voices-v1.0.bin ]  || curl -sSL -O https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```

```python
# tts.py (run from the work dir; use nohup/background for long scripts)
import json,re,os,hashlib,subprocess,soundfile as sf
from kokoro_onnx import Kokoro
K=os.environ.get('KOKORO_DIR',os.path.expanduser('~/.cache/kokoro'))
def say(t):  # make symbols speakable; extend per topic: file names, acronyms, product names
    t=t.replace('Esc','Escape').replace('Ctrl+','Control ').replace('Alt+','Alt ').replace('Shift+','Shift ').replace('Option+','Option ')
    return re.sub(r'(?<![\w])/(\w+)',r'slash \1',t)
N=json.load(open('narration.json')); os.makedirs('audio',exist_ok=True)
k=Kokoro(f'{K}/kokoro-v1.0.onnx',f'{K}/voices-v1.0.bin')
for sid,txt in N.items():
    s=say(txt); h=hashlib.md5((s+'af_heart').encode()).hexdigest()[:8]; out=f'audio/{sid}.{h}.mp3'
    if os.path.exists(out): continue
    [os.remove('audio/'+f) for f in os.listdir('audio') if f.startswith(sid+'.')]
    a,sr=k.create(s,voice='af_heart',speed=1.0,lang='en-us'); sf.write('tmp.wav',a,sr)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i','tmp.wav','-ac','1','-b:a','48k',out],check=True)
```

Mono 48 kbps MP3 keeps ~16 clips of ~18 s to about 2 MB total. In build.py embed as `data:audio/mpeg;base64,...` in an `AUDIO` object keyed by scene id. If the model download or install fails (offline, blocked network), tell the user plainly and ask whether to continue captions-only; do not silently switch to browser speech.

## 3. Engine requirements (single file, no external hosts)

- **Intro overlay** with two buttons: enter with sound (this click unlocks audio) and enter silently (captions only).
- **One reused `Audio` element.** On scene enter: render caption, set `au.src=AUDIO[id]`, play. Caption words are `<span>`s lit proportionally to `currentTime/duration` weighted by character count; provide replay, stop, mute and auto-advance toggle. Pulse the Next button when narration ends.
- **Lip-sync**: `AudioContext.createMediaElementSource(au)` once, an `AnalyserNode`, RMS of time-domain data each animation frame drives mouth height. Resume the context on play. Fall back to a sine wobble if wiring throws.
- **Character**: inline SVG with moods (neutral, happy, think, alert), random blinking, idle bob, a bow animation on level-up, and an accessory that changes with progress (belt/headband colour, rank badge, etc.). A `react(text, mood)` helper shows a transient reaction line under the caption after learner actions.
- **Progress**: top-bar dots (clickable), level indicator, toast on level-up, arrow keys for next/back (skip when a scene sets `captureArrows`).
- **Scene hooks**: `onKey(e)` per scene for keyboard trainers (preventDefault for browser-owned combos like Ctrl+R/S/O; always offer a clickable fallback; avoid combos browsers never expose such as Ctrl+T/W/N).
- **Widget helpers**: `quiz(root, questions, onDone)` with per-answer explanation, keep/cut sorters, need-to-tool matchers, slider-driven advice, flip-card deck with category chips, tabbed mini-demos with CSS-animated lanes, a mock terminal with command history, a context-style meter.
- **Accessibility and robustness**: real buttons, `aria-label`s on dots and SVG, `prefers-reduced-motion` respected, toggle for scanlines/effects, works at 390 px wide with no horizontal scroll, no localStorage/sessionStorage (state in memory only), a visible captions-only path.
- **Style system**: CSS variables for palette, a system font stack (no web fonts unless the host allows), and every theme choice (CRT scanlines, blueprint grid, cockpit gauges, notebook paper) as CSS overlays so the engine is theme-independent.

## 4. Quality bar

- Every claim traceable to a fetched source; call out version-dependent features and avoid naming fast-changing model names.
- Each scene teaches one thing, has one primary interaction, and narration under ~25 seconds.
- Learner always has an escape hatch: skip narration, jump via dots, replay.
- Final scene gives something to keep (copyable cheat sheet) and a pass/fail quiz that gates the top rank.
- Test before delivering; if any scene throws, fix and re-run the whole walkthrough.

## 5. Reuse tips

Copy a previous explainer folder, replace `narration.json` and the scenes, change the CSS variables and the character SVG, run `tts.py` then `build.py`. In Claude Code, install this skill at `~/.claude/skills/animated-explainer-builder/SKILL.md` (all projects) or `.claude/skills/animated-explainer-builder/SKILL.md` (one repo).
