import json,base64,glob,os
N=json.load(open('narration.json'))
A={}
for sid in N:
    f=sorted(glob.glob(f'audio/{sid}.*.mp3'))[-1]
    A[sid]='data:audio/mpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode()
P=lambda n:open('parts/'+n).read()
html=P('a_head.html')+'<script>\nconst NARR='+json.dumps(N)+';\nconst AUDIO='+json.dumps(A)+';\n'+P('b_engine.js')+P('c_scenes1.js')+P('d_scenes2.js')+P('e_scenes3.js')+P('f_scenes_parallel.js')+'\nbuild();\n</script>\n</body></html>'
os.makedirs('dist',exist_ok=True)
open('dist/claude-code-dojo.html','w').write(html)
print(len(html)//1024,'KB')
