import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function addDirectRoute(app: express.Express) {
  // Add route for the homepage that bypasses React rendering - use the react-fallback.html
  app.get('/', (req, res, next) => {
    console.log('ROOT ROUTE HANDLER CALLED');
    console.log('Sending file from:', path.join(process.cwd(), 'client', 'public', 'react-fallback.html'));
    // Use explicit error handling
    res.sendFile(path.join(process.cwd(), 'client', 'public', 'react-fallback.html'), (err) => {
      if (err) {
        console.error('ERROR SENDING FALLBACK HTML:', err);
        next(err);
      } else {
        console.log('FALLBACK HTML SENT SUCCESSFULLY');
      }
    });
  });
  
  // Keep the original /direct route
  app.get('/direct', (req, res, next) => {
    console.log('DIRECT ROUTE HANDLER CALLED');
    res.sendFile(path.join(process.cwd(), 'client', 'public', 'direct.html'), (err) => {
      if (err) {
        console.error('ERROR SENDING DIRECT HTML:', err);
        next(err);
      } else {
        console.log('DIRECT HTML SENT SUCCESSFULLY');
      }
    });
  });
  
  // Add route for profile pages that bypasses React
  app.get('/direct-profile/:slug', (req, res, next) => {
    const slug = req.params.slug;
    console.log(`DIRECT PROFILE ROUTE HANDLER CALLED FOR SLUG: ${slug}`);
    
    // Serve the profile.html file
    res.sendFile(path.join(process.cwd(), 'client', 'public', 'profile.html'), (err) => {
      if (err) {
        console.error('ERROR SENDING PROFILE HTML:', err);
        next(err);
      } else {
        console.log('PROFILE HTML SENT SUCCESSFULLY');
      }
    });
  });
  
  // Redirect route for production site
  app.get('/redirect', (req, res) => {
    console.log('REDIRECT ROUTE HANDLER CALLED');
    res.sendFile(path.join(process.cwd(), 'client', 'public', 'redirect.html'), (err) => {
      if (err) {
        console.error('ERROR SENDING REDIRECT HTML:', err);
        res.status(500).send('Error loading redirect page');
      } else {
        console.log('REDIRECT HTML SENT SUCCESSFULLY');
      }
    });
  });
}