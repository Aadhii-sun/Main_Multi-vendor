const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');

exports.getSellers = async (req, res) => {
  try {
    const sellers = await SellerProfile.find().populate('user', 'name email');
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSellerById = async (req, res) => {
  try {
    const seller = await SellerProfile.findById(req.params.id).populate('user', 'name email');
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveSeller = async (req, res) => {
  try {
    const seller = await SellerProfile.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    seller.approved = true;
    await seller.save();
    // Also update the linked user
    const user = await User.findById(seller.user);
    if (user) {
      user.isSellerApproved = true;
      await user.save();
    }
    res.json({ message: 'Seller approved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
