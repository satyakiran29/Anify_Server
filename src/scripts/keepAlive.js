import dotenv from 'dotenv';
dotenv.config();

// RENDER_EXTERNAL_URL is automatically set by Render for web services.
// If it's not set, fall back to APP_URL or a default local URL for testing.
let url = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;

if (!url) {
  console.error('Error: Neither RENDER_EXTERNAL_URL nor APP_URL is set in environment variables.');
  process.exit(1);
}

// Prepend https:// if only a bare domain/host is provided (e.g. from Render's host property)
if (!url.startsWith('http://') && !url.startsWith('https://')) {
  url = `https://${url}`;
}

// We append the public API prefix to ping the server stats endpoint
const pingUrl = `${url.replace(/\/$/, '')}/api/v1/wallpapers/stats`;
console.log(`[Keep-Alive] Initiating ping to: ${pingUrl}`);

try {
  const response = await fetch(pingUrl);
  if (response.ok) {
    console.log(`[Keep-Alive] Success: Ping returned HTTP status ${response.status}`);
  } else {
    console.error(`[Keep-Alive] Warning: Server returned status ${response.status} ${response.statusText}`);
  }
} catch (error) {
  console.error(`[Keep-Alive] Error: Request failed. Details: ${error.message}`);
  process.exit(1);
}
