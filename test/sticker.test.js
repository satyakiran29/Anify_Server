import { initStickerDatabase, stickerDb } from '../src/utils/stickerDb.js';

initStickerDatabase();

const allPacks = stickerDb.getAll();
console.log('Total sticker packs loaded:', allPacks.length);

console.log('\n--- Sample Packs Loaded ---');
allPacks.forEach(p => {
  console.log(`[${p.id}] ${p.name} (${p.category}) - ${p.identifier} | Previews: ${p.previews.length}`);
});

const neko = stickerDb.getById('nekostickerpack120');
console.log('\nLookup nekostickerpack120:', neko ? neko.name : 'NOT FOUND');

const frieren = stickerDb.getById('SousouNoFrierenAnime');
console.log('Lookup SousouNoFrierenAnime:', frieren ? frieren.name : 'NOT FOUND');

const kang = stickerDb.getById('kang_5852054126_by_Sticker_kang_robot');
console.log('Lookup kang_5852054126_by_Sticker_kang_robot:', kang ? kang.name : 'NOT FOUND');
