import asyncio, json
from playwright.async_api import async_playwright
U='http://127.0.0.1:8080/'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':390,'height':800}, accept_downloads=True)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        async def go(h): await pg.evaluate(f"location.hash='{h}'"); await pg.wait_for_timeout(300)
        await pg.goto(U); await pg.wait_for_selector('#view h1')
        # english
        await pg.click('.tbtn:has-text("EN")'); await pg.wait_for_timeout(300)
        print('lang en:', await pg.inner_text('#view h1'))
        # GSM calc
        await go('#/calc/gsm')
        ins=pg.locator('#view input[type=text]')
        await ins.nth(0).fill('1.8'); await ins.nth(1).fill('100')
        await pg.click('button:has-text("Calculate")'); await pg.wait_for_timeout(200)
        print('gsm:', (await pg.inner_text('.res .big')))
        await pg.click('button:has-text("Save to history")'); await pg.wait_for_timeout(300)
        print('history items:', await pg.locator('#view .item').count())
        await ins.nth(1).fill('0'); await pg.click('button:has-text("Calculate")')
        print('zero err:', await pg.locator('.err').nth(1).inner_text())
        # machine
        await go('#/machines/new')
        await pg.locator('#view input').nth(0).fill('M-01'); await pg.click('button:has-text("Save")'); await pg.wait_for_timeout(400)
        print('machine h1:', await pg.inner_text('#view h1'))
        # shift record
        await go('#/shift/new')
        f=pg.locator('#view input[type=text]')
        await f.nth(0).fill('A'); await f.nth(2).fill('M-01')
        await f.nth(4).fill('200'); await f.nth(5).fill('150'); await f.nth(6).fill('')
        await pg.click('button:has-text("Save")'); await pg.wait_for_timeout(300)
        print('unit-required err shown:', (await pg.locator('.err').filter(has_text='required').count())>0)
        await f.nth(6).fill('kg'); await pg.click('button:has-text("Save")'); await pg.wait_for_timeout(500)
        print('detail:', (await pg.inner_text('#view table'))[:120].replace('\n',' | '))
        await go('#/shift/summary'); print('summary:', (await pg.inner_text('#view table >> nth=0')).replace('\n',' | ')[:100])
        # csv export
        await go('#/shift')
        async with pg.expect_download() as d: await pg.click('button:has-text("Export CSV")')
        dl=await d.value; path=await dl.path(); data=open(path,'rb').read()
        print('csv bom:', data[:3]==b'\xef\xbb\xbf', data.decode('utf-8-sig').splitlines()[1][:60])
        # backup export
        await go('#/backup')
        async with pg.expect_download() as d: await pg.click('button:has-text("Export JSON backup")')
        dl=await d.value; bk=json.load(open(await dl.path())); print('backup counts:', {k:len(v) for k,v in bk['data'].items() if v})
        # persistence after reload
        await pg.reload(); await pg.wait_for_selector('#view h1'); await go('#/shift')
        print('persisted records:', await pg.locator('#view .item').count())
        # search bangla alias
        await go('#/search?q=%E0%A6%B8%E0%A7%81%E0%A6%87%20%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%A8')
        print('bn search first:', (await pg.locator('#view .item a').first.inner_text()))
        # offline
        await pg.wait_for_timeout(1500)
        sw=await pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>!!r&&!!r.active)")
        print('sw active:', sw)
        await ctx.set_offline(True); await pg.reload(); await pg.wait_for_selector('#view h1', timeout=8000)
        await go('#/defects'); print('offline defects:', await pg.locator('#view .item').count())
        await ctx.set_offline(False)
        # restore invalid file
        await go('#/backup'); open('/tmp/bad.json','w').write('{"app":"x"}')
        await pg.set_input_files('input[type=file]','/tmp/bad.json'); await pg.click('button:has-text("Check and restore")'); await pg.wait_for_timeout(300)
        print('bad restore:', (await pg.inner_text('#view .warnbox'))[:80].replace('\n',' '))
        # restore valid with replace
        open('/tmp/good.json','w').write(json.dumps(bk))
        await pg.set_input_files('input[type=file]','/tmp/good.json'); await pg.click('button:has-text("Check and restore")'); await pg.wait_for_timeout(300)
        await pg.click('.modal button.danger'); await pg.wait_for_timeout(400)
        print('restore msg:', await pg.inner_text('[role=status] .res'))
        # desktop layout
        await pg.set_viewport_size({'width':1200,'height':800}); await go('#/')
        box=await pg.locator('nav.nav').bounding_box(); print('desktop nav x/w:', box['x'], box['width'])
        print('errors:', errs or 'none')
        await b.close()
asyncio.run(main())
