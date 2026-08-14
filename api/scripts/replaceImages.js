// One-off: swap dead Firebase Storage URLs for hotlinked Unsplash photos.
// Run: node api/scripts/replaceImages.js
import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import Listing from '../models/listing.model.js';

const HOMES = [
  'photo-1568605114967-8130f3a36994', 'photo-1570129477492-45c003edd2be',
  'photo-1512917774080-9991f1c4c750', 'photo-1600596542815-ffad4c1539a9',
  'photo-1600585154340-be6161a56a0c', 'photo-1600607687939-ce8a6c25118c',
  'photo-1600566753086-00f18fb6b3ea', 'photo-1600210492486-724fe5c67fb0',
  'photo-1605276374104-dee2a0ed3cd6', 'photo-1580587771525-78b9dba3b914',
  'photo-1613490493576-7fde63acd811', 'photo-1493809842364-78817add7ffb',
  'photo-1502672260266-1c1ef2d93688', 'photo-1560448204-e02f11c3d0e2',
  'photo-1522708323590-d24dbb6b0267', 'photo-1600047509807-ba8f99d2cdde',
  'photo-1583608205776-bfd35f0d9f83', 'photo-1598928506311-c55ded91a20c',
  'photo-1616594039964-ae9021a400a0', 'photo-1615874959474-d609969a20ed',
];

const url = (id) => `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`;

await mongoose.connect(process.env.MONGO);

const listings = await Listing.find({}, 'name imageUrls');
if (!listings.length) throw new Error('No listings found — wrong MONGO database?');

const backup = `api/scripts/imageUrls.backup.json`;
if (!fs.existsSync(backup)) {
  fs.writeFileSync(backup, JSON.stringify(
    listings.map((l) => ({ _id: l._id, imageUrls: l.imageUrls })), null, 2));
  console.log(`Backed up ${listings.length} listings to ${backup}`);
} else {
  console.log(`Backup already exists at ${backup}, leaving it alone`);
}

for (const [i, l] of listings.entries()) {
  // keep each listing's original image count, give each a different slice of HOMES
  const count = Math.min(Math.max(l.imageUrls.length, 1), 6);
  const urls = Array.from({ length: count }, (_, j) => url(HOMES[(i * 3 + j) % HOMES.length]));
  await Listing.updateOne({ _id: l._id }, { imageUrls: urls });
  console.log(`${l.name} -> ${count} image(s)`);
}

console.log(`\nDone. ${listings.length} listings updated.`);
await mongoose.disconnect();
