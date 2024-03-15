// File: magentoController.js

const MagentoStore = require('../../models/magento/info'); // Adjust the path as necessary

// Fetch all Magento store configurations
exports.getAllStores = async (req, res) => {
  try {
    const stores = await MagentoStore.find();
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save Magento store details
exports.createStore = async (req, res) => {
  const store = new MagentoStore(req.body);
  console.log(req.body)
  try {
    const newStore = await store.save();
    res.status(201).json(newStore);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get details of a particular user's Magento store configurations
exports.getStoresByUser = async (req, res) => {
  try {
    const stores = await MagentoStore.find({ adminId: req.params.adminId });
    if (stores.length === 0) {
      return res.status(404).json({ message: 'No stores found for this user' });
    }
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Magento store details
exports.updateStore = async (req, res) => {
    try {
      const updatedStore = await MagentoStore.findOneAndUpdate(
        { adminId: req.params.id }, // This is the filter, make sure 'adminId' is indexed and unique if you treat it as an identifier
        req.body, // These are the updates
        { new: true } // This option returns the document after update
      );
  
      if (!updatedStore) {
        return;
      }
  
      res.json(updatedStore);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  

// Delete a Magento store configuration
exports.deleteStore = async (req, res) => {
  try {
    await MagentoStore.findByIdAndDelete(req.params.id);
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
