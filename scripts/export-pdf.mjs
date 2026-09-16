import { createReadStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { chromium } from 'playwright';

const projectRoot = resolve(import.meta.dirname, '..');
const distDirectory = join(projectRoot, 'dist');
const outputDirectory = join(projectRoot, 'output', 'pdf');
const outputPath = join(outputDirectory, 'resume.pdf');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (request, response) => {
  try {
    const requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
    const filePath = normalize(join(distDirectory, relativePath));

    if (!filePath.startsWith(distDirectory)) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

await new Promise((resolveServer, rejectServer) => {
  server.once('error', rejectServer);
  server.listen(0, '127.0.0.1', resolveServer);
});

let browser;

try {
  const { port } = server.address();
  await mkdir(outputDirectory, { recursive: true });

  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch {
    browser = await chromium.launch({ headless: true });
  }

  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
  });

  console.log(`PDF created: ${outputPath}`);
} catch (error) {
  console.error('Unable to export PDF. Install Google Chrome or run: npx playwright install chromium');
  throw error;
} finally {
  await browser?.close();
  await new Promise((resolveServer) => server.close(resolveServer));
}
