import { downloadAndConvertToWebp } from '../src/utils/stickerConverter.js';
import fs from 'fs';
import path from 'path';

console.log('Testing downloadAndConvertToWebp utility...');
const testUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';
const resultPath = await downloadAndConvertToWebp(testUrl, 'test_pikachu', 'preview_0.webp');
console.log('Converted/Saved path:', resultPath);
const diskPath = path.join(process.cwd(), 'public', 'stickers', 'test_pikachu', 'preview_0.webp');
console.log('File exists on disk:', fs.existsSync(diskPath));
if (!fs.existsSync(diskPath)) throw new Error('Test preview file was not created on disk');
fs.rmSync(path.join(process.cwd(), 'public', 'stickers', 'test_pikachu'), { recursive: true, force: true });
console.log('CLEANUP COMPLETE & CONVERSION TEST PASSED!');
