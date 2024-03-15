// File: MagentoRoutes.js

const express = require('express');
const router = express.Router();
const magentoController = require('../controller/magento/magentoController'); // Adjust the path as necessary

router.get('/stores', magentoController.getAllStores);
router.post('/stores', magentoController.createStore);
router.get('/stores/user/:adminId', magentoController.getStoresByUser);
router.patch('/stores/:id', magentoController.updateStore);
router.delete('/stores/:id', magentoController.deleteStore);

module.exports = router;
