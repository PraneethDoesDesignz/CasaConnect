// One-off: replace Chicago-derived names/addresses and placeholder prices with
// Indian equivalents, so the data matches the rupee pricing the UI renders.
// Run: node api/scripts/reseedIndia.js
import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import Listing from '../models/listing.model.js';

// Keyed by the current listing name. Anything not listed here is left alone.
const REPLACEMENTS = {
  '1720 N Paulina St': {
    name: '3 BHK villa with terrace garden in Whitefield',
    address: 'Palm Meadows, Ramagondanahalli, Whitefield, Bengaluru 560066',
    description:
      'An independent villa on a quiet lane, with a covered car porch and a planted terrace. Three bedrooms upstairs, living and kitchen at ground level. Walking distance to Varthur Main Road.',
  },
  '1520 N Ashland Ave #1': {
    name: '3 BHK apartment near Baner Road, Pune',
    address: 'Rohan Tarang, Baner Road, Pune 411045',
    description:
      'Third floor flat in a gated society with lift and power backup. Cross ventilation in every room, and a balcony facing the internal garden rather than the road.',
  },
  '1746 N Artesian Ave': {
    name: '5 BHK independent house in Jubilee Hills',
    address: 'Road No. 36, Jubilee Hills, Hyderabad 500033',
    description:
      'A large family house across two floors with a private lawn and parking for three cars. Suits a joint family or a company lease.',
  },
  '1320 N Moorman St': {
    name: '4 BHK duplex with sea breeze in Bandra West',
    address: 'Perry Cross Road, Bandra West, Mumbai 400050',
    description:
      'Duplex on the upper floors of a low-rise building, with a wide living room, four bedrooms and a service area. Quiet residential pocket, close to Carter Road.',
  },
  '121 W Chestnut St Unit 2104': {
    name: '2 BHK in a high floor tower at Powai',
    address: 'Hiranandani Gardens, Powai, Mumbai 400076',
    description:
      'Twenty-first floor flat with a clear lake view from the living room and master bedroom. Society has a gym, pool and covered parking.',
  },
  '8 E 9th St Apt 2302': {
    name: '1 BHK studio flat near Koramangala 5th Block',
    address: '80 Feet Road, Koramangala 5th Block, Bengaluru 560095',
    description:
      'Compact one bedroom flat with a modular kitchen, ideal for a working professional. Cafes, gyms and bus routes are a short walk away.',
  },
  'Harper Court Apartments': {
    name: '2 BHK in a gated society at Gachibowli',
    address: 'Aparna Sarovar, Nallagandla, Gachibowli, Hyderabad 500019',
    description:
      'Two bedroom flat in a large gated community with a clubhouse, jogging track and round the clock security. Close to the IT corridor.',
  },
  '839 S Miller St #2': {
    name: '2 BHK flat near Anna Nagar West, Chennai',
    address: 'Sixth Avenue, Anna Nagar West, Chennai 600040',
    description:
      'Well maintained second floor flat with tiled floors and covered two-wheeler parking. Metro station and schools are within a kilometre.',
  },
  'Post Chicago853': {
    name: '2 BHK apartment in Sector 62, Noida',
    address: 'Sector 62, Noida, Uttar Pradesh 201309',
    description:
      'Two bedroom flat with a balcony off the living room, in a society with lift, power backup and visitor parking. Close to the Blue Line metro.',
  },
  'Testing Property': {
    name: '1 BHK near Kalyani Nagar, Pune',
    address: 'Lane 6, Kalyani Nagar, Pune 411006',
    description:
      'A small, bright one bedroom flat on the second floor, with a covered balcony and a shared terrace. Suits a single occupant or a couple.',
  },
  "Varshith's Listing": {
    name: '1 BHK studio in HSR Layout Sector 2',
    address: '17th Main Road, HSR Layout Sector 2, Bengaluru 560102',
    description:
      'Furnished studio with an attached bathroom and a small kitchenette. Rent includes water and society maintenance.',
  },
  "Praneeth's Listing": {
    name: '3 BHK builder floor in Greater Kailash',
    address: 'Greater Kailash II, New Delhi 110048',
    description:
      'An entire floor of a builder house, with three bedrooms, a formal living room and a private entrance. Market and metro are close by.',
  },
  "Charan's Listing": {
    name: '1 BHK flat near Andheri East metro',
    address: 'Chakala, Andheri East, Mumbai 400099',
    description:
      'One bedroom flat a few minutes from the metro and the airport. Building has a lift and a watchman.',
  },
};

// Placeholder rows were saved at the ₹50 form minimum. Give them real numbers.
const PRICE_FLOOR = 1000;
const FALLBACK_PRICE = { rent: 22000, sale: 4200000 };

await mongoose.connect(process.env.MONGO);

const listings = await Listing.find({});
if (!listings.length) throw new Error('No listings found - wrong MONGO database?');

const backup = 'api/scripts/listings.pre-india.backup.json';
if (!fs.existsSync(backup)) {
  fs.writeFileSync(
    backup,
    JSON.stringify(
      listings.map((l) => ({
        _id: l._id,
        name: l.name,
        address: l.address,
        description: l.description,
        regularPrice: l.regularPrice,
      })),
      null,
      2
    )
  );
  console.log(`Backed up ${listings.length} listings to ${backup}`);
} else {
  console.log(`Backup already exists at ${backup}, leaving it alone`);
}

let renamed = 0;
let repriced = 0;

for (const listing of listings) {
  const patch = {};
  // Some names carry stray whitespace from the original form submissions.
  const swap = REPLACEMENTS[listing.name] ?? REPLACEMENTS[listing.name.trim()];

  if (swap) {
    Object.assign(patch, swap);
    renamed++;
  }

  if (Number(listing.regularPrice) < PRICE_FLOOR) {
    patch.regularPrice = FALLBACK_PRICE[listing.type] ?? FALLBACK_PRICE.rent;
    if (!listing.offer) patch.discountPrice = 0;
    repriced++;
  }

  if (Object.keys(patch).length === 0) continue;
  await Listing.updateOne({ _id: listing._id }, patch);
  console.log(`${listing.name} -> ${patch.name || listing.name}`);
}

console.log(`\nDone. ${renamed} renamed, ${repriced} repriced.`);
await mongoose.disconnect();
