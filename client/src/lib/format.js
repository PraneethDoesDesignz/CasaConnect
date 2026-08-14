const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** Full price, e.g. "₹42,00,000". */
export const price = (n) => inr.format(Number(n) || 0);

/** Compact price for dense surfaces, e.g. "₹42L", "₹1.2Cr", "₹18,000". */
export const priceShort = (n) => {
  const v = Number(n) || 0;
  if (v >= 1e7) return `₹${+(v / 1e7).toFixed(2)}Cr`;
  if (v >= 1e5) return `₹${+(v / 1e5).toFixed(2)}L`;
  return inr.format(v);
};

/** What a listing actually costs today, honoring an active offer. */
export const activePrice = (listing) =>
  listing.offer ? listing.discountPrice : listing.regularPrice;

/** Suffix that turns a number into a rate, e.g. "/month" on rentals. */
export const priceSuffix = (listing) => (listing.type === 'rent' ? '/month' : '');
