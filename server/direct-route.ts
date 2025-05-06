import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function addDirectRoute(app: express.Express) {
  // Add route to redirect to production site
  app.get('/', (req, res, next) => {
    console.log('PRODUCTION REDIRECT ROUTE HANDLER CALLED');
    res.sendFile(path.join(process.cwd(), 'client', 'public', 'production-redirect.html'), (err) => {
      if (err) {
        console.error('ERROR SENDING PRODUCTION REDIRECT HTML:', err);
        next(err);
      } else {
        console.log('PRODUCTION REDIRECT HTML SENT SUCCESSFULLY');
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
  
  // Add route for profile redirects to production site
  app.get('/p/:slug', (req, res) => {
    const slug = req.params.slug;
    console.log(`PROFILE REDIRECT FOR SLUG: ${slug}`);
    res.redirect(`https://qrmingle.app/p/${slug}`);
  });
  
  // Add catchall route for any missing routes
  app.get('*', (req, res) => {
    // Skip API routes and asset paths
    if (req.path.startsWith('/api/') || req.path.includes('.')) {
      return res.status(404).send('Not found');
    }
    
    // Redirect to production site with the same path
    console.log(`CATCHALL REDIRECT TO PRODUCTION: ${req.path}`);
    res.redirect(`https://qrmingle.app${req.path}`);
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