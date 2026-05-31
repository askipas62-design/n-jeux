import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const API_BASE = 'https://freizeitshop24.com/api/products';
const IMAGE_DIR = path.resolve('public/images/products');
const TOTAL_PAGES = 5;
const BATCH_SIZE = 3; // parallel downloads

const EXISTING_IDS = [131,130,129,128,127,126,125,124,123,122,121,120,119,118,117,116,115,114,113,112,111,110,109,108];
const CATEGORY_PREFIX = {
  'Baby-foot': 'ba',
  'Billard': 'bi',
  'Tennis de Table': 'pi',
  'Trampoline': 'tr',
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error(`JSON parse error: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const contentType = res.headers['content-type'] || '';
      let ext;
      if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = '.jpg';
      else if (contentType.includes('webp')) ext = '.webp';
      else if (contentType.includes('png')) ext = '.png';
      else ext = '.jpg'; // default

      const finalDest = dest.replace(/\.(png|jpg|jpeg|webp)$/, ext);
      const file = fs.createWriteStream(finalDest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(finalDest); });
    }).on('error', reject).on('timeout', function() { this.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchAllProducts() {
  const all = [];
  for (let page = 1; page <= TOTAL_PAGES; page++) {
    console.log(`Fetching page ${page}...`);
    const data = await fetchJSON(`${API_BASE}?page=${page}`);
    all.push(...data.products);
    console.log(`  Got ${data.products.length} products (total: ${all.length})`);
  }
  return all;
}

function mapBadge(badge) {
  if (!badge || badge === '') return undefined;
  const map = { 'new': 'Nouveau', 'sale': 'Promo', 'best_seller': 'Meilleure Vente' };
  return map[badge] || badge;
}

function computeRating(id) {
  return 4.6 + ((id % 5) * 0.05);
}

async function processProduct(product) {
  if (EXISTING_IDS.includes(product.id)) return null;

  const prefix = CATEGORY_PREFIX[product.category?.name];
  if (!prefix) {
    console.warn(`  Skipping product ${product.id}: unknown category "${product.category?.name}"`);
    return null;
  }

  const productId = `${prefix}-${product.id}`;
  const name = product.i18n?.['name.de-DE'] || product.name;

  // Download primary image
  let imageUrl = product.images?.[0];
  if (!imageUrl) {
    console.warn(`  No image for ${productId}`);
    return null;
  }

  const imgSlug = slugify(name);
  const tempDest = path.join(IMAGE_DIR, `${imgSlug}-${product.id}.png`);
  
  try {
    console.log(`  Downloading image for ${productId}...`);
    const finalPath = await downloadFile(imageUrl, tempDest);
    const imageName = path.basename(finalPath);
    console.log(`    Saved: ${imageName}`);

    return {
      id: productId,
      name: product.name,
      category: product.category?.slug || prefix,
      brand: product.brand || undefined,
      priceHT: Math.round((product.price / 1.2) * 100) / 100,
      stock: product.inStock ? 10 : 0,
      badge: mapBadge(product.badge),
      rating: computeRating(product.id),
      desc: stripHtml(product.description || ''),
      image: `/images/products/${imageName}`,
    };
  } catch (err) {
    console.error(`  Failed to download image for ${productId}: ${err.message}`);
    return null;
  }
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&rsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&agrave;/g, 'à')
    .replace(/&acirc;/g, 'â')
    .replace(/&icirc;/g, 'î')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&ucirc;/g, 'û')
    .replace(/&euml;/g, 'ë')
    .replace(/&iuml;/g, 'ï')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&bull;/g, '•')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

function generateEntry(product) {
  const fields = [
    `    id: "${product.id}",`,
    `    name: ${JSON.stringify(product.name)},`,
    `    category: "${product.category}",`,
  ];
  if (product.brand) fields.push(`    brand: "${product.brand}",`);
  fields.push(`    priceHT: ${product.priceHT},`);
  fields.push(`    stock: ${product.stock},`);
  if (product.badge) fields.push(`    badge: "${product.badge}",`);
  fields.push(`    rating: ${product.rating},`);
  fields.push(`    desc: ${JSON.stringify(product.desc)},`);
  fields.push(`    image: "${product.image}",`);
  return `  {\n${fields.join('\n')}\n  }`;
}

async function main() {
  console.log('=== Fetching all products from API ===');
  const allProducts = await fetchAllProducts();
  console.log(`\nTotal products: ${allProducts.length}`);
  
  const newProducts = allProducts.filter(p => !EXISTING_IDS.includes(p.id));
  console.log(`New products to add: ${newProducts.length}`);

  // Ensure image directory exists
  fs.mkdirSync(IMAGE_DIR, { recursive: true });

  // Process products in batches
  const results = [];
  for (let i = 0; i < newProducts.length; i += BATCH_SIZE) {
    const batch = newProducts.slice(i, i + BATCH_SIZE);
    console.log(`\n--- Batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(newProducts.length/BATCH_SIZE)} ---`);
    const batchResults = await Promise.all(batch.map(p => processProduct(p)));
    for (const r of batchResults) {
      if (r) results.push(r);
    }
  }

  // Sort by category then ID
  results.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.id.localeCompare(b.id);
  });

  // Generate TypeScript
  console.log(`\n=== Generating products.ts entries (${results.length} products) ===`);
  const entries = results.map(generateEntry).join(',\n\n');
  
  const output = `import type { Product } from "./products";

export const newProducts: Product[] = [
${entries}
];
`;

  fs.writeFileSync('src/data/new-products.ts', output, 'utf-8');
  console.log(`\nDone! Output written to src/data/new-products.ts`);
  console.log(`Added ${results.length} new products`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
