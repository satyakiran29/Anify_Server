import ffmpegPath from 'ffmpeg-static';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';

const execPromise = util.promisify(exec);

console.log('ffmpeg path:', ffmpegPath);
console.log('ffmpeg binary exists:', fs.existsSync(ffmpegPath));

const { stdout } = await execPromise(`"${ffmpegPath}" -version`);
console.log('ffmpeg version output:\n', stdout.split('\n')[0]);
