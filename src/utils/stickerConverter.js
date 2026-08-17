import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import ffmpegPath from 'ffmpeg-static';
import { getRawGithubUrl } from './gitSync.js';

const execPromise = util.promisify(exec);

/**
 * Downloads a remote image or video sticker (e.g. .webm from Telegram) and converts it to a standard .webp image.
 * 
 * @param {string} remoteUrl The remote URL to download
 * @param {string} packSlug The sticker pack identifier
 * @param {string} filename The target filename, e.g. "preview_0.webp"
 * @returns {Promise<string>} Public URL path to the saved .webp file
 */
export async function downloadAndConvertToWebp(remoteUrl, packSlug, filename) {
  try {
    if (!remoteUrl || typeof remoteUrl !== 'string') return '';
    
    // If it's already a local webp path, return raw URL
    if (remoteUrl.startsWith('/stickers/') && remoteUrl.endsWith('.webp')) {
      return getRawGithubUrl(remoteUrl);
    }

    const dir = path.join(process.cwd(), 'public', 'stickers', packSlug);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Ensure output filename has .webp extension
    const baseName = path.parse(filename).name;
    const finalFilename = `${baseName}.webp`;
    const finalFilePath = path.join(dir, finalFilename);

    // Fetch the remote file
    const res = await fetch(remoteUrl, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) {
      console.warn(`[StickerConverter] Failed to fetch ${remoteUrl}: HTTP ${res.status}`);
      return remoteUrl;
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    // Check if it is a WebM video/animated sticker
    const isWebm = remoteUrl.toLowerCase().includes('.webm') || buffer.slice(0, 4).toString('hex') === '1a45dfa3';

    if (isWebm && ffmpegPath) {
      // Save temporary .webm file and convert to .webp frame via ffmpeg
      const tempWebmPath = path.join(dir, `_temp_${baseName}.webm`);
      fs.writeFileSync(tempWebmPath, buffer);

      try {
        const cmd = `"${ffmpegPath}" -y -ss 00:00:00.050 -i "${tempWebmPath}" -vframes 1 -vf "scale=512:512:force_original_aspect_ratio=decrease" -q:v 85 "${finalFilePath}"`;
        await execPromise(cmd);
      } catch (convErr) {
        // Fallback without timestamp seeking
        try {
          const fallbackCmd = `"${ffmpegPath}" -y -i "${tempWebmPath}" -vframes 1 -q:v 85 "${finalFilePath}"`;
          await execPromise(fallbackCmd);
        } catch (fbErr) {
          console.error(`[StickerConverter] ffmpeg conversion failed for ${remoteUrl}:`, fbErr.message);
          fs.writeFileSync(finalFilePath, buffer);
        }
      } finally {
        if (fs.existsSync(tempWebmPath)) {
          try { fs.unlinkSync(tempWebmPath); } catch (_) {}
        }
      }
    } else {
      // Direct write for static images (.webp, .png, .jpg)
      fs.writeFileSync(finalFilePath, buffer);
    }

    const relativePath = `/stickers/${packSlug}/${finalFilename}`;
    return getRawGithubUrl(relativePath);
  } catch (err) {
    console.error(`[StickerConverter] Error converting ${remoteUrl}:`, err.message);
    return remoteUrl;
  }
}
