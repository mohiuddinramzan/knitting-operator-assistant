import asyncio, json
from playwright.async_api import async_playwright
ROUTES=['#/','#/defects','#/defects/needle-line','#/defects/new','#/calc','#/calc/gsm','#/calc/production','#/shift','#/shift/new','#/shift/summary','#/shift/handover','#/more','#/machines','#/machines/new','#/guides/needles','#/maintenance','#/learn','#/learn/lesson/safety-first','#/learn/quiz/quiz','#/dictionary','#/notebook','#/backup','#/settings','#/about','#/search?q=needle']
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':390,'height':800})
        errs=[]
        pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
        pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
        await pg.goto('http://127.0.0.1:8080/')
        await pg.wait_for_selector('#view h1')
        for r in ROUTES:
            await pg.evaluate(f"location.hash='{r}'")
            await pg.wait_for_timeout(250)
            txt=await pg.inner_text('#view')
            warn=await pg.locator('#view .warnbox').count()
            print(r, len(txt), 'ERRBOX' if warn else 'ok')
        print('\n'.join(errs) or 'no console errors')
        await b.close()
asyncio.run(main())
