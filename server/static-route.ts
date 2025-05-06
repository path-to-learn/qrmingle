import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function addStaticRoute(app: express.Express) {
  // Simple direct HTML route for testing
  app.get('/test', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QrMingle Test Page</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f5f7fa;
          }
          .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            width: 100%;
            max-width: 400px;
            text-align: center;
          }
          .title {
            color: #3b82f6;
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          .button {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .button:hover {
            background-color: #2563eb;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1 class="title">QrMingle</h1>
          <p>Welcome to QrMingle - The digital networking platform</p>
          <p>This is a static test page</p>
          <button class="button" onclick="alert('Button clicked!')">Click Me</button>
        </div>
        <script>
          console.log('Static test page loaded successfully');
        </script>
      </body>
      </html>
    `);
  });
}