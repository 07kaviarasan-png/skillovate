const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();
app.use(express.static(path.join(__dirname, 'frontend')));

const PORT = 3005;

async function captureScreenshots() {
  const server = app.listen(PORT, async () => {
    console.log(`Static server listening on port ${PORT}`);
    
    const browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Intercept requests to mock API responses so it doesn't wait indefinitely or redirect
    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: {} })
        });
      } else {
        request.continue();
      }
    });

    const outDir = path.join(__dirname, 'docs', 'ui-audit');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const capture = async (name, url, setupFn = null) => {
      console.log(`Capturing ${name}...`);
      await page.goto(`http://localhost:${PORT}/${url}`, { waitUntil: 'domcontentloaded' });
      if (setupFn) await setupFn(page);
      await new Promise(r => setTimeout(r, 1500)); // wait for renders/animations
      await page.screenshot({ path: path.join(outDir, `${name}.png`) });
    };

    try {
      await capture('landing-page', 'index.html');

      await capture('learner-dashboard', 'learner.html', async (p) => {
        await p.evaluate(() => {
          localStorage.setItem('sk_user', JSON.stringify({ name: 'Learner One', role: 'student' }));
          localStorage.setItem('skillovate_token', 'dummy');
        });
        await p.reload({ waitUntil: 'domcontentloaded' });
      });

      await capture('admin-dashboard', 'institutional.html', async (p) => {
        await p.evaluate(() => {
          localStorage.setItem('skillovate_token', 'dummy_token');
          localStorage.setItem('skillovate_user', JSON.stringify({ 
            name: 'College Admin', 
            role: 'college_admin',
            college_id: 'col_123',
            college_name: 'Tech Institute'
          }));
        });
        await p.reload({ waitUntil: 'domcontentloaded' });
      });

      await capture('faculty-dashboard', 'institutional.html', async (p) => {
        await p.evaluate(() => {
          localStorage.setItem('skillovate_token', 'dummy_token');
          localStorage.setItem('skillovate_user', JSON.stringify({ 
            name: 'Dr. Faculty', 
            role: 'faculty',
            college_id: 'col_123',
            college_name: 'Tech Institute'
          }));
        });
        await p.reload({ waitUntil: 'domcontentloaded' });
      });

      await capture('recruiter-dashboard', 'institutional.html', async (p) => {
        await p.evaluate(() => {
          localStorage.setItem('skillovate_token', 'dummy_token');
          localStorage.setItem('skillovate_user', JSON.stringify({ 
            name: 'Recruiter', 
            role: 'recruiter',
            college_id: 'col_123',
            college_name: 'Tech Institute'
          }));
        });
        await p.reload({ waitUntil: 'domcontentloaded' });
      });

      await capture('assessment-screen', 'learner.html', async (p) => {
        await p.evaluate(() => {
          const tab = document.querySelector('[data-tab="assessments"]');
          if (tab) tab.click();
        });
      });

      await capture('interview-screen', 'hr.html');

      await capture('placement-screen', 'institutional.html', async (p) => {
        await p.evaluate(() => {
          localStorage.setItem('skillovate_user', JSON.stringify({ role: 'college_admin' }));
          const tab = document.querySelector('[onclick="switchTab(\\\'placements\\\')"]');
          if (tab) tab.click();
        });
      });

      console.log('All screenshots captured successfully!');
    } catch (err) {
      console.error('Error taking screenshots:', err);
    } finally {
      await browser.close();
      server.close();
    }
  });
}

captureScreenshots();
