const fs = require('fs');
const path = require('path');

const EXISTING_IDS = [131,130,129,128,127,126,125,124,123,122,121,120,119,118,117,116,115,114,113,112,111,110,109,108];
const CAT_PREFIX = { 'Baby-foot':'ba', 'Billard':'bi', 'Tennis de Table':'pi', 'Trampoline':'tr' };

const allProducts = JSON.parse(fs.readFileSync('/tmp/all-products.json', 'utf-8'));
const prodMap = {};
for (const p of allProducts) {
  prodMap[p.id] = p;
}

// Get existing products from products.ts
const existingContent = fs.readFileSync('src/data/products.ts', 'utf-8');

// Build full product data from progress + existing products
const progress = JSON.parse(fs.readFileSync('/tmp/progress.json', 'utf-8'));
const doneIds = new Set(progress.map(e => e.id));

// Add pi-37 and pi-36 which have images but aren't in progress
const images = fs.readdirSync('public/images/products');

// Find ALL new products with images
const allNewEntries = [];
const allNewIds = new Set();

// First, add progress entries
for (const e of progress) {
  allNewEntries.push(e);
  allNewIds.add(e.id);
}

// Then, add any new products with images not in progress
for (const p of allProducts) {
  if (EXISTING_IDS.includes(p.id)) continue;
  const prefix = CAT_PREFIX[p.category?.name];
  if (!prefix) continue;
  const pid = prefix + '-' + p.id;
  if (allNewIds.has(pid)) continue;
  
  const img = images.find(f => f.includes('-' + p.id + '.'));
  if (!img) continue;
  
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
  
  allNewEntries.push({
    id: pid,
    name: p.name,
    category: p.category?.slug || prefix,
    brand: p.brand || undefined,
    priceHT, stock: p.inStock ? 10 : 0, badge, rating: Math.round(rating * 10) / 10,
    desc, image: '/images/products/' + img,
  });
  allNewIds.add(pid);
}

// Sort all entries by category then id
allNewEntries.sort((a,b) => a.category !== b.category ? a.category.localeCompare(b.category) : a.id.localeCompare(b.id));

console.log('Existing products: 24');
console.log('New products with images:', allNewEntries.length);
console.log('Total:', 24 + allNewEntries.length);

// Generate TypeScript entries
let entries = '';
for (const e of allNewEntries) {
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
  entries += '  {\n' + fields.join('\n') + '\n  },\n';
}

// Get existing interface from products.ts
const interfaceMatch = existingContent.match(/export interface Product \{[\s\S]*?^\}/m);
const interfaceDef = interfaceMatch ? interfaceMatch[0] : '';

// Build new file: existing products + new products
const existingProducts = [];
// Extract existing product entries from the original file
const existingMatch = existingContent.match(/export const products: Product\[\] = \[([\s\S]*?)\];/);
if (existingMatch) {
  const existingBody = existingMatch[1];
  // Parse each existing entry
  const lines = existingBody.split('\n');
  let currentEntry = '';
  let braceCount = 0;
  let inEntry = false;
  for (const line of lines) {
    currentEntry += line + '\n';
    if (line.includes('{')) { inEntry = true; braceCount += (line.match(/\{/g) || []).length; }
    if (line.includes('}')) { braceCount -= (line.match(/\}/g) || []).length; }
    if (inEntry && braceCount === 0) {
      existingProducts.push(currentEntry.trim());
      currentEntry = '';
      inEntry = false;
    }
  }
}

// Reconstruct: interface + existing products + new products
const header = `export interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  priceHT: number;
  stock: number;
  badge?: string;
  rating: number;
  desc: string;
  image: string;
}

export const products: Product[] = [
`;

const existingBody = existingMatch ? existingMatch[1].trim() + ',\n' : '';

const newFile = header + existingBody + entries + '];\n';

fs.writeFileSync('src/data/products.ts', newFile, 'utf-8');
console.log('\nWritten src/data/products.ts');

// Show category counts
const cats = {};
for (const e of allNewEntries) {
  cats[e.category] = (cats[e.category] || 0) + 1;
}
console.log('\nNew products by category:', JSON.stringify(cats));
