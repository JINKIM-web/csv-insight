import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'msedge'});
try {
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173/');
await page.locator('input[type=file]').setInputFiles({name:'history-test.csv',mimeType:'text/csv',buffer:Buffer.from('y,group\n1,A\n2,B\n3,A\n4,B\n')});
await page.waitForURL('**/analyses/**');await page.getByText('저장 완료',{exact:true}).waitFor();const first=page.url();
await page.getByLabel('타깃 변수',{exact:true}).selectOption('c1');await page.getByLabel('그룹 변수',{exact:true}).selectOption('c2');await page.getByLabel('분석 시작 행',{exact:true}).fill('2');await page.getByLabel('그룹 값 필터',{exact:true}).fill('A');await page.getByText('저장 완료',{exact:true}).waitFor();
await page.reload();await page.getByText('저장 완료',{exact:true}).waitFor();assert.equal(await page.getByLabel('타깃 변수',{exact:true}).inputValue(),'c1');assert.equal(await page.getByLabel('분석 시작 행',{exact:true}).inputValue(),'2');assert.equal(await page.getByLabel('그룹 값 필터',{exact:true}).inputValue(),'A');
await page.getByRole('button',{name:'조건 적용 및 재분석'}).click();await page.waitForURL(url=>url.toString()!==first);await page.getByText('저장 완료',{exact:true}).waitFor();
await page.getByRole('link',{name:'분석 이력',exact:true}).click();assert.equal(await page.locator('tbody tr').count(),2);
await page.locator('tbody a').last().click();await page.getByText('저장 완료',{exact:true}).waitFor();assert.equal(page.url(),first);
await page.route('**/api/v1/**',route=>route.abort());await page.reload();await page.getByText('저장 완료',{exact:true}).waitFor();await page.getByRole('tab',{name:'시각화',exact:true}).click();await page.locator('canvas').first().waitFor();await page.unroute('**/api/v1/**');
const storage=await page.evaluate(async()=>{const h=await import('/src/lib/history.ts');const list=await h.historyList();const source=list[0];for(let i=0;i<7;i++)await h.saveHistory({...source,id:'retention-'+i,lastUsed:Date.now()+i});const five=await h.historyList();await h.saveHistory({...source,id:'expired',lastUsed:Date.now()-h.retentionMs});const expired=await h.historyList();await h.deleteHistory(five[0].id);const afterDelete=await h.historyList();return {five:five.map(i=>i.id),expired:expired.map(i=>i.id),afterDelete:afterDelete.length}});
assert.deepEqual(storage.five,['retention-6','retention-5','retention-4','retention-3','retention-2']);assert.ok(!storage.expired.includes('expired'));assert.equal(storage.afterDelete,4);const expiredAlone=await page.evaluate(async()=>{const h=await import('/src/lib/history.ts');const list=await h.historyList();const source=list[0];for(const item of list)await h.deleteHistory(item.id);await h.saveHistory({...source,id:'valid',lastUsed:Date.now()});await h.saveHistory({...source,id:'expired-alone',lastUsed:Date.now()-h.retentionMs});const result=(await h.historyList()).map(i=>i.id);for(let i=0;i<4;i++)await h.saveHistory({...source,id:'ui-'+i,lastUsed:Date.now()+i});return result});assert.deepEqual(expiredAlone,['valid']);
await page.getByRole('link',{name:'분석 이력',exact:true}).click();await page.locator('tbody tr').first().waitFor();await page.getByRole('button',{name:'브라우저 이력 삭제'}).first().click();await page.waitForFunction(()=>document.querySelectorAll('tbody tr').length===4);
assert.deepEqual(errors,[]);console.log('PASS: IndexedDB real dataset/result, draft autosave, reload, preserved results, offline reopen/charts, latest five, expiry and deletion.');
} finally {await browser.close()}
