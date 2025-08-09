const express = require('express');
const { answerQuery } = require('../controllers/queryController');
const { protectedRoute } = require('../middleware/auth');
const { pdfUpload } = require('../config/multer_config');

const queryRoutes = express.Router();

queryRoutes.post("/answer", protectedRoute, pdfUpload.single('pdfUrl'), answerQuery);

module.exports = queryRoutes;