const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync('/tmp/all-products.json', 'utf-8'));
const EXISTING = [131,130,129,128,127,126,125,124,123,122,121,120,119,118,117,116,115,114,113,112,111,110,109,108];
const CAT_PREFIX = { 'Baby-foot':'ba', 'Billard':'bi', 'Tennis de Table':'pi', 'Trampoline':'tr' };
const IMG_DIR = 'public/images/products';
fs.mkdirSync(IMG_DIR, { recursive: true });

const newProds = products.filter(p => !EXISTING.includes(p.id));
console.log('Processing', newProds.length, 'new products\n');

function slugify(t) {
  return t.toLowerCase().replace(/[\u2013\u2014]/g,'-').replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').substring(0,60);
}

function download(url, dest, retries = 3) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest, retries).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      const ct = res.headers['content-type'] || '';
      let ext = '.jpg';
      if (ct.includes('png')) ext = '.png';
      else if (ct.includes('webp')) ext = '.webp';
      else if (ct.includes('jpeg') || ct.includes('jpg')) ext = '.jpg';
      
      const finalDest = dest.replace(/\.\w+$/, ext);
      const file = fs.createWriteStream(finalDest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(path.basename(finalDest)); });
    });
    req.on('error', (err) => {
      if (retries > 0) {
        setTimeout(() => download(url, dest, retries - 1).then(resolve).catch(reject), 2000);
      } else {
        reject(err);
      }
    });
    req.on('timeout', () => {
      req.destroy();
      if (retries > 0) {
        setTimeout(() => download(url, dest, retries - 1).then(resolve).catch(reject), 2000);
      } else {
        reject(new Error('timeout'));
      }
    });
  });
}

const BATCH = 2;
let entries = [];
let completed = false;

// Load progress if exists
const progressFile = '/tmp/progress.json';
if (fs.existsSync(progressFile)) {
  try {
    entries = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
    console.log('Loaded', entries.length, 'entries from progress file');
  } catch(e) {}
}

const doneIds = new Set(entries.map(e => e.id));

(async () => {
  const toProcess = newProds.filter(p => {
    const prefix = CAT_PREFIX[p.category?.name];
    if (!prefix) return false;
    return !doneIds.has(prefix + '-' + p.id);
  });
  
  console.log('Already done:', entries.length, 'Remaining:', toProcess.length, '\n');

  for (let i = 0; i < toProcess.length; i += BATCH) {
    const batch = toProcess.slice(i, i + BATCH);
    const results = await Promise.allSettled(batch.map(async (p) => {
      const prefix = CAT_PREFIX[p.category?.name];
      if (!prefix) return null;
      const pid = prefix + '-' + p.id;
      const name = p.i18n?.['name.de-DE'] || p.name;
      const url = p.images?.[0];
      if (!url) { console.log('  SKIP', pid, '- no image'); return null; }
      
      const imgSlug = slugify(name);
      const tempDest = path.join(IMG_DIR, imgSlug + '-' + p.id + '.jpg');
      
      // Skip if file already exists
      const existingFiles = fs.readdirSync(IMG_DIR).filter(f => f.includes('-' + p.id + '.'));
      if (existingFiles.length > 0) {
        const fname = existingFiles[0];
        console.log('  EXISTS', pid, '\u2192', fname);
        return buildEntry(p, pid, '/images/products/' + fname);
      }
      
      try {
        const fname = await download(url, tempDest);
        console.log('  OK', pid, '\u2192', fname);
        return buildEntry(p, pid, '/images/products/' + fname);
      } catch (e) {
        console.log('  FAIL', pid, '-', e.message);
        return null;
      }
    }));
    
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        entries.push(r.value);
      }
    }
    
    // Save progress every 10 entries
    if (entries.length % 10 === 0 && entries.length > 0) {
      fs.writeFileSync(progressFile, JSON.stringify(entries, null, 2));
      console.log('  [Progress saved:', entries.length, 'entries]\n');
    }
  }
  
  fs.writeFileSync(progressFile, JSON.stringify(entries, null, 2));
  
  // Generate output
  entries.sort((a,b) => a.category !== b.category ? a.category.localeCompare(b.category) : a.id.localeCompare(b.id));
  
  let output = '';
  for (const e of entries) {
    const fields = [
      '    id: "' + e.id + '",',
      '    name: ' + JSON.stringify(e.name) + ',',
      '    category: "' + e.category + '",'
    ];
    if (e.brand) fields.push('    brand: "' + e.brand + '",');
    fields.push('    priceHT: ' + e.priceHT + ',');
    fields.push('    stock: ' + e.stock + ',');
    if (e.badge) fields.push('    badge: "' + e.badge + '",');
    fields.push('    rating: ' + e.rating + ',');
    fields.push('    desc: ' + JSON.stringify(e.desc) + ',');
    fields.push('    image: "' + e.image + '",');
    output += '  {\n' + fields.join('\n') + '\n  },\n';
  }
  
  fs.writeFileSync('src/data/new-products.ts', 'import type { Product } from "./products";\n\nexport const newProducts: Product[] = [\n' + output + '];\n');
  console.log('\nDone!', entries.length, 'products written to src/data/new-products.ts');
})();

function buildEntry(p, pid, imagePath) {
  const priceHT = Math.round((p.price / 1.2) * 100) / 100;
  const badgeMap = { 'new':'Nouveau', 'sale':'Promo', 'best_seller':'Meilleure Vente' };
  const badge = badgeMap[p.badge] || undefined;
  const rating = 4.6 + ((p.id % 5) * 0.05);
  const desc = (p.description || '').replace(/<[^>]+>/g,'').replace(/&rsquo;/g,"'").
    replace(/&amp;/g,'&').replace(/&eacute;/g,'\u00e9').replace(/&egrave;/g,'\u00e8').
    replace(/&ecirc;/g,'\u00ea').replace(/&agrave;/g,'\u00e0').replace(/&acirc;/g,'\u00e2').
    replace(/&ocirc;/g,'\u00f4').replace(/&ucirc;/g,'\u00fb').replace(/&ccedil;/g,'\u00e7').
    replace(/&laquo;/g,'\u00ab').replace(/&raquo;/g,'\u00bb').replace(/&bull;/g,'\u2022').
    replace(/&ndash;/g,'-').replace(/&mdash;/g,'-').replace(/&lt;/g,'<').
    replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/\n\s*\n\s*\n/g,'\n\n').trim();
  
  return {
    id: pid,
    name: p.name,
    category: p.category?.slug || prefix,
    brand: p.brand || undefined,
    priceHT, stock: p.inStock ? 10 : 0, badge, rating: Math.round(rating * 10) / 10,
    desc, image: imagePath,
  };
}
