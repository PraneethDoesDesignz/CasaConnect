import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';
import { createLead, findLeadByEmail, updateLeadByEmail } from '../utils/salesforceLeadUtils.js';
import { sendFollowupEmail } from '../utils/mailer.js';

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id.toString() !== req.params.id.toString())
    return next(errorHandler(401, 'You can only update your own account!'));
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    // Salesforce: Update lead if exists, else create new lead for profile update
    if (updatedUser && updatedUser.email) {
      const leadId = await findLeadByEmail(updatedUser.email);
      if (leadId) {
        await updateLeadByEmail(updatedUser.email, {
          Email: updatedUser.email,
          FirstName: updatedUser.username,
          LastName: '- CasaConnect User',
          Status: 'Profile Updated',
          Company: 'CasaConnect'
        });
      } else {
        await createLead({
          Email: updatedUser.email,
          FirstName: updatedUser.username,
          LastName: '- CasaConnect User',
          Status: 'Profile Updated',
          Company: 'CasaConnect'
        });
      }
      // Send profile update email
      await sendFollowupEmail(updatedUser.email, updatedUser.username, 'profileUpdate');
    }

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id.toString() !== req.params.id.toString())
    return next(errorHandler(401, 'You can only delete your own account!'));
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    // Salesforce: Always create a new lead for profile deletion
    if (user && user.email) {
      await createLead({
        Email: user.email,
        FirstName: user.username,
        LastName: '- CasaConnect User',
        Status: 'Profile Deleted',
        Company: 'CasaConnect'
      });
      // Send goodbye email
      await sendFollowupEmail(user.email, user.username, 'goodbye');
    }
    res.clearCookie('access_token');
    res.status(200).json('User has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const listings = await Listing.find({ userRef: userId });
    res.status(200).json({ success: true, listings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching listings', error: error.message });
  }
};

export const getUser = async (req, res, next) => {
  try {
    
    const user = await User.findById(req.params.id);
  
    if (!user) return next(errorHandler(404, 'User not found!'));
  
    const { password: pass, ...rest } = user._doc;
  
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
