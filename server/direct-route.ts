import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function addDirectRoute(app: express.Express) {
  // Direct HTML route that bypasses React rendering
  app.get('/direct', (req, res, next) => {
    console.log('DIRECT ROUTE HANDLER CALLED');
    console.log('Sending file from:', path.join(process.cwd(), 'client', 'public', 'direct.html'));
    // Use explicit error handling
    res.sendFile(path.join(process.cwd(), 'client', 'public', 'direct.html'), (err) => {
      if (err) {
        console.error('ERROR SENDING DIRECT HTML:', err);
        next(err);
      } else {
        console.log('DIRECT HTML SENT SUCCESSFULLY');
      }
    });
  });
}