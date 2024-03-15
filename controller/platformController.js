// Assuming Platform model is already define
 const Platform = require('../models/Platform');

// Create
const createPlatform = async (req, res, next) => {
    try {
      const platform = new Platform(req.body);
      await platform.save();
      res.send(platform);
    } catch (error) {
      next(error);
    }
};

// Read (Get a single platform by ID)
const getPlatformById = async (req, res, next) => {
    try {
      const platform = await Platform.findById(req.params.id);
      res.send(platform);
    } catch (error) {
      next(error);
    }
};

// Update
const updatePlatform = async (req, res, next) => {
    try {
      const platform = await Platform.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.send(platform);
    } catch (error) {
      next(error);
    }
};

// Delete
const deletePlatform = async (req, res, next) => {
    try {
      console.log("iuuiiiji" + req.params.id)
      await Platform.findByIdAndDelete(req.params.id);
      res.send({ message: 'Platform successfully deleted' });
    } catch (error) {
      next(error);
    }
};

  
  // Read (Get all platforms)
  const getAllPlatforms = async (req, res) => {
    try {
      const platforms = await Platform.find({});
      res.send(platforms);
    //   return platforms;
    } catch (error) {
      throw error;
    }
  };
  
  
  
  module.exports = {
    createPlatform,
    getPlatformById,
    getAllPlatforms,
    updatePlatform,
    deletePlatform
  };