import json,re,os,hashlib,subprocess,sys
import soundfile as sf
K=os.environ.get('KOKORO_DIR',os.path.expanduser('~/.cache/kokoro'))
from kokoro_onnx import Kokoro
def say(t):
    t=t.replace("CLAUDE.md","Claude M D").replace("Claude -p","Claude dash p")
    t=t.replace(".claude/rules","dot claude slash rules").replace(".claude/worktrees","dot claude slash worktrees")
    t=re.sub(r"(?<![\w])/(\w+)",r"slash \1",t)
    t=t.replace("Ctrl+","Control ").replace("Alt+","Alt ").replace("Option+","Option ").replace("Shift+","Shift ").replace("Esc","Escape")
    t=t.replace(" @ "," at ")
    return t
N=json.load(open('narration.json'))
os.makedirs('audio',exist_ok=True)
k=Kokoro(K+'/kokoro-v1.0.onnx',K+'/voices-v1.0.bin')
for sid,txt in N.items():
    s=say(txt); h=hashlib.md5((s+"af_heart").encode()).hexdigest()[:8]
    out=f'audio/{sid}.{h}.mp3'
    if os.path.exists(out): continue
    for f in os.listdir('audio'):
        if f.startswith(sid+'.'): os.remove('audio/'+f)
    a,sr=k.create(s,voice='af_heart',speed=1.0,lang='en-us')
    sf.write('tmp.wav',a,sr)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i','tmp.wav','-ac','1','-b:a','48k',out],check=True)
    print(sid,round(len(a)/sr,1),'s',flush=True)
print('done')
