import { test, expect } from '@playwright/test';
async function begin(page){
 await page.goto('/mvp.html');
 await page.locator('input[name="moment"][value="start"]').check();
 await page.locator('input[name="parent"][value="remind"]').check();
 await page.locator('input[name="method"][value="five"]').check();
 await page.locator('input[name="delay"][value="30"]').check();
 await page.locator('input[name="nag"][value="4"]').check();
 await page.getByRole('button',{name:'建立我的 7 天計畫'}).click();
 await expect(page.locator('#plan')).toBeVisible();
 await page.locator('#goal').fill('英文單字五個');
 await page.locator('#startTime').fill('19:30');
 await page.locator('#savePlan').click();
 await expect(page.locator('#daily')).toBeVisible();
}
test.beforeEach(async ({page})=>{await page.goto('/mvp.html');await page.evaluate(()=>localStorage.clear());});
test('診斷、約定、Day 1 回報與趨勢圖',async ({page})=>{
 await begin(page);
 await page.locator('#minutes').fill('25');
 await page.locator('#reminders').fill('3');
 await page.locator('#conflict').selectOption('2');
 await page.locator('#note').fill('先休息十分鐘');
 await page.locator('#checkin button[type="submit"]').click();
 await expect(page.locator('#daysDone')).toHaveText('1 / 7');
 await expect(page.locator('#avgStart')).toHaveText('25 分');
 await expect(page.locator('#review')).toContainText('已記錄 1 天');
 await expect(page.locator('#minutesChart circle')).toHaveCount(1);
 await page.reload();
 await expect(page.locator('#daysDone')).toHaveText('1 / 7');
 await expect(page.locator('#dayLabel')).toContainText('Day 2');
});
test('同一天不能重複回報',async ({page})=>{
 await begin(page);
 await page.locator('#minutes').fill('15');await page.locator('#reminders').fill('2');
 await page.locator('#checkin button[type="submit"]').click();
 await page.locator('#minutes').fill('10');await page.locator('#reminders').fill('1');
 page.once('dialog',d=>d.accept());
 await page.locator('#checkin button[type="submit"]').click();
 await expect(page.locator('#daysDone')).toHaveText('1 / 7');
});
test('匯出 JSON 並重新匯入',async ({page})=>{
 await begin(page);
 await page.locator('#minutes').fill('20');await page.locator('#reminders').fill('1');
 await page.locator('#checkin button[type="submit"]').click();
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#export').click()]);
 expect(download.suggestedFilename()).toContain('.json');
 const payload=await page.evaluate(()=>localStorage.getItem('parent-seven-day-mvp-v1'));
 await page.evaluate(()=>localStorage.clear());await page.reload();
 await expect(page.locator('#daysDone')).toHaveText('0 / 7');
 page.once('dialog',d=>d.accept());
 await page.locator('#file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(payload)});
 await expect(page.locator('#daysDone')).toHaveText('1 / 7');
});
test('不合法備份不得覆蓋現有資料',async ({page})=>{
 await begin(page);
 page.once('dialog',d=>d.accept());
 await page.locator('#file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"entries":[{"day":1,"date":"bad","minutes":-3}]}')});
 await expect(page.locator('#plan')).toBeVisible();
 await expect(page.locator('#daysDone')).toHaveText('0 / 7');
});
test('親子對話隨情境切換',async ({page})=>{
 await page.locator('#scenario').selectOption('screen');
 await expect(page.locator('#script')).toContainText('手機');
 await page.locator('#scenario').selectOption('argue');
 await expect(page.locator('#script')).toContainText('休息十分鐘');
});
test('首頁有 MVP 入口',async ({page})=>{
 await page.goto('/index.html');
 await expect(page.locator('a[href="mvp.html"]').first()).toBeVisible();
});
