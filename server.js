import express from 'express';
import vhost from 'vhost';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const sitesDir = path.join(__dirname, 'sites');

// Automatically set up virtual hosts for each user directory
fs.readdirSync(sitesDir).forEach(site => {
  const sitePath = path.join(sitesDir, site);
  if (fs.statSync(sitePath).isDirectory()) {
    const siteApp = express();
    siteApp.use(express.static(sitePath));
    app.use(vhost(`${site}.localhost`, siteApp));
    console.log(`Subdomain ready: http://${site}.localhost`);
  }
});

app.listen(3001, () => {
  console.log('AI HTML server running on port 3001');
});
