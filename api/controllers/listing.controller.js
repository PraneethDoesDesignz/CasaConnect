import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';
import { createListingLead } from '../utils/salesforceLeadUtils.js';

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    if (req.user && req.user.email) {
      try {
        console.log('Attempting to create Salesforce lead for:', req.user.email);
        const leadId = await createListingLead({
          email: req.user.email,
          username: req.user.username,
          action: 'created'
        });
        console.log('Salesforce lead created for new listing:', req.user.email, 'LeadId:', leadId);
      } catch (err) {
        console.error('Failed to create Salesforce lead for new listing:', err);
      }
    } else {
      console.log('No req.user or req.user.email present, skipping lead creation');
    }
    return res.status(201).json(listing);
  } catch (error) {
    console.error('Error in createListing:', error);
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }

  // Fix: Compare as strings to avoid ObjectId vs string mismatch
  if (listing.userRef.toString() !== req.user.id.toString()) {
    return next(errorHandler(401, 'You can only delete your own listings!'));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    if (req.user && req.user.email) {
      try {
        await createListingLead({
          email: req.user.email,
          username: req.user.username,
          action: 'deleted'
        });
        console.log('Salesforce lead created for deleted listing:', req.user.email);
      } catch (err) {
        console.error('Failed to create Salesforce lead for deleted listing:', err);
      }
    }
    res.status(200).json('Listing has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }

  // Fix: Compare as strings to avoid ObjectId vs string mismatch
  if (listing.userRef.toString() !== req.user.id.toString()) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (req.user && req.user.email) {
      try {
        await createListingLead({
          email: req.user.email,
          username: req.user.username,
          action: 'updated'
        });
        console.log('Salesforce lead created for updated listing:', req.user.email);
      } catch (err) {
        console.error('Failed to create Salesforce lead for updated listing:', err);
      }
    }
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;

    if (offer === undefined || offer === 'false') {
      offer = { $in: [false, true] };
    }

    let furnished = req.query.furnished;

    if (furnished === undefined || furnished === 'false') {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;

    if (parking === undefined || parking === 'false') {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;

    if (type === undefined || type === 'all') {
      type = { $in: ['sale', 'rent'] };
    }

    const searchTerm = req.query.searchTerm || '';

    const sort = req.query.sort || 'createdAt';

    const order = req.query.order || 'desc';

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: 'i' },
      offer,
      furnished,
      parking,
      type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
