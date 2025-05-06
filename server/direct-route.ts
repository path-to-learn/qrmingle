import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function addDirectRoute(app: express.Express) {
  // Direct HTML route that bypasses React rendering
  app.get('/direct', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client', 'public', 'direct.html'));
  });
}