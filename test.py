import os
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(channel=os.environ.get('PW_CHANNEL') or None,args=['--autoplay-policy=no-user-gesture-required'])
    pg=b.new_page(viewport={'width':1280,'height':800})
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    pg.goto('file://'+os.path.abspath('dist/claude-code-dojo.html'))
    pg.click('#bEnter'); pg.wait_for_timeout(1500)
    pg.screenshot(path='/tmp/s0.png')
    for i in range(1,22):
        pg.click('#bNext'); pg.wait_for_timeout(350)
        if i==1:
            pg.click('#feed1 .btn >> nth=0'); pg.click('#room1 .btn >> nth=1')
        if i==3:
            pg.keyboard.press('Shift+Tab'); pg.click('[data-a="2"]')
        if i==7:
            for _ in range(3): pg.keyboard.press('Escape')
        if i==14:
            pg.click('#bw16'); pg.click('#ba16'); pg.click('#bl16')
        if i==15:
            pg.click('#ac17 .btn >> nth=0'); pg.click('#ac17 .btn >> nth=0')
        if i==16:
            pg.click('#tools18 .btn >> nth=0')
        if i==17:
            pg.click('#tab19 .chip >> nth=1'); pg.click('#opt19 .chip >> nth=2')
        if i==18:
            pg.click('#st20 .btn >> nth=0')
        if i==19:
            pg.click('#tb21 .chip >> nth=2'); pg.click('#op21 .chip >> nth=0')
        if i==20:
            pg.fill('#in14','/status'); pg.press('#in14','Enter'); pg.fill('#in14','hello'); pg.press('#in14','Enter')
        pg.screenshot(path=f'/tmp/s{i}.png')
    print('audio paused?',pg.evaluate('au.paused'),'cur',pg.evaluate('cur'))
    b.close()
print('ERRORS:',errs)
