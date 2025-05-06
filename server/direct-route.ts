import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function addDirectRoute(app: express.Express) {
  // Add route for serving the original home page
  app.get('/', (req, res, next) => {
    console.log('ORIGINAL HOME ROUTE HANDLER CALLED');
    res.sendFile(path.join(process.cwd(), 'client', 'public', 'original-home.html'), (err) => {
      if (err) {
        console.error('ERROR SENDING ORIGINAL HOME HTML:', err);
        next(err);
      } else {
        console.log('ORIGINAL HOME HTML SENT SUCCESSFULLY');
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
  
  // Test route for React basic testing
  app.get('/test', (req, res) => {
    console.log('TEST ROUTE HANDLER CALLED');
    res.sendFile(path.join(process.cwd(), 'client', 'public', 'test.html'), (err) => {
      if (err) {
        console.error('ERROR SENDING TEST HTML:', err);
        res.status(500).send('Error loading test page');
      } else {
        console.log('TEST HTML SENT SUCCESSFULLY');
      }
    });
  });
  
  // React App route using ESM imports
  app.get('/react-app', (req, res) => {
    console.log('REACT APP ROUTE HANDLER CALLED');
    res.sendFile(path.join(process.cwd(), 'client', 'public', 'react-app.html'), (err) => {
      if (err) {
        console.error('ERROR SENDING REACT APP HTML:', err);
        res.status(500).send('Error loading React app page');
      } else {
        console.log('REACT APP HTML SENT SUCCESSFULLY');
      }
    });
  });
}