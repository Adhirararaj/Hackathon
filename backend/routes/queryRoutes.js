const express = require('express');
const { answerQuery, speechToText, generateAnswer,getFrequentlyAskedQuestions } = require('../controllers/queryController');
const { protectedRoute } = require('../middleware/auth');
const { pdfUpload, audioUpload } = require('../config/multer_config');

const queryRoutes = express.Router();

// Original combined endpoint
queryRoutes.post("/answer", protectedRoute, pdfUpload.single('pdfUrl'), answerQuery);

// New separate endpoints for 2-API flow
queryRoutes.post("/speech-to-text", protectedRoute, audioUpload.single('voiceData'), speechToText);
queryRoutes.post("/generate-answer", protectedRoute, pdfUpload.single('pdfUrl'), generateAnswer);

// Frequently asked questions endpoint
queryRoutes.get("/frequently-asked", protectedRoute, getFrequentlyAskedQuestions);

module.exports = queryRoutes;