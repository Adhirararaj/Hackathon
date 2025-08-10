const userModel = require('../models/User');
const queryModel = require('../models/Query');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

axios.defaults.baseURL = "http://localhost:8000";

const answerQuery = async (req, res) => {
  try {
    const { voiceData, text, language } = req.body;
    const pdfFile = req.file;

    const userId = req.user._id;
    const user = await userModel.findOne({ _id: userId });

    // Base question from inputs
    let question = (voiceData || "") + (text || "");

    // Append account details if linked
    if (user.isLinked) {
      question += ` My account details are Account No.: ${user.accountNo} Ifsc code is: ${user.ifscCode} branch is: ${user.branch}`;
    }

    // Validate
    if (!question.trim()) {
      return res.json({ success: false, message: "Question cannot be empty" });
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("question", question);

    if (pdfFile) {
      formData.append("pdf_file", fs.createReadStream(pdfFile.path), {
        filename: pdfFile.originalname,
        contentType: pdfFile.mimetype
      });
    }

    const apiEndpoint = pdfFile ? "/api/adaptive-answer-with-pdf" : "/api/adaptive-answer";
    
    const response = await axios.post(apiEndpoint, formData, {
      headers: {
        ...formData.getHeaders(),
      }
    });

    const { long_answer, short_answer } = response.data;

    // Save query
    const query = await queryModel.create({
      userId,
      voiceData,
      text,
      language,
      shortAnswer: short_answer,
      longAnswer: long_answer,
      providedDoc: pdfFile?.path
    });

    // Link query to user
    await userModel.findOneAndUpdate(
      { _id: userId },
      { $push: { queries: query._id } },
      { new: true }
    );

    // Clean up file
    if (pdfFile && fs.existsSync(pdfFile.path)) {
      fs.unlinkSync(pdfFile.path);
    }

    return res.json({ success: true, query, message: "Answer given" });

  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const errorMessage = error.response?.data?.detail || error.message;
    return res.json({
      success: false,
      message: typeof errorMessage === 'string' ? errorMessage : 'An error occurred processing your request'
    });
  }
};

// API 1: Speech-to-text conversion
const speechToText = async (req, res) => {
  try {
    const { text } = req.body;
    const audioFile = req.file;

    // If text is provided directly, return it
    if (text && text.trim()) {
      return res.json({ 
        success: true, 
        extractedText: text.trim(),
        message: "Text extracted successfully" 
      });
    }

    // If audio file is provided, process it
    if (audioFile) {
      // Here you would integrate with a speech-to-text service
      // For now, we'll simulate the process
      console.log('Processing audio file:', audioFile.originalname);
      
      // Simulate speech-to-text conversion
      // In a real implementation, you would call a service like Google Speech-to-Text, AWS Transcribe, etc.
      const extractedText = "This is a simulated speech-to-text conversion. Replace this with actual STT service integration.";
      
      // Clean up file
      if (fs.existsSync(audioFile.path)) {
        fs.unlinkSync(audioFile.path);
      }

      return res.json({ 
        success: true, 
        extractedText,
        message: "Audio converted to text successfully" 
      });
    }

    return res.json({ 
      success: false, 
      message: "No text or audio file provided" 
    });

  } catch (error) {
    console.error('Speech-to-text error:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.json({
      success: false,
      message: error.message || 'An error occurred during speech-to-text conversion'
    });
  }
};

// API 2: Answer generation
const generateAnswer = async (req, res) => {
  try {
    const { text } = req.body;
    const pdfFile = req.file;

    const userId = req.user._id;
    const user = await userModel.findOne({ _id: userId });

    // Base question from inputs
    let question = text || "";

    // Append account details if linked
    if (user.isLinked) {
      question += ` My account details are Account No.: ${user.accountNo} Ifsc code is: ${user.ifscCode} branch is: ${user.branch}`;
    }

    // Validate
    if (!question.trim() && !pdfFile) {
      return res.json({ success: false, message: "No text or document provided" });
    }

    // Prepare form data for the external API
    const formData = new FormData();
    formData.append("question", question);

    if (pdfFile) {
      formData.append("pdf_file", fs.createReadStream(pdfFile.path), {
        filename: pdfFile.originalname,
        contentType: pdfFile.mimetype
      });
    }

    const apiEndpoint = pdfFile ? "/api/adaptive-answer-with-pdf" : "/api/adaptive-answer";
    
    const response = await axios.post(apiEndpoint, formData, {
      headers: {
        ...formData.getHeaders(),
      }
    });

    const { long_answer, short_answer } = response.data;

    // Save query
    const query = await queryModel.create({
      userId,
      text,
      shortAnswer: short_answer,
      longAnswer: long_answer,
      providedDoc: pdfFile?.path
    });

    // Link query to user
    await userModel.findOneAndUpdate(
      { _id: userId },
      { $push: { queries: query._id } },
      { new: true }
    );

    // Clean up file
    if (pdfFile && fs.existsSync(pdfFile.path)) {
      fs.unlinkSync(pdfFile.path);
    }

    return res.json({ 
      success: true, 
      query, 
      message: "Answer generated successfully" 
    });

  } catch (error) {
    console.error('Answer generation error:', error.response?.data || error.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const errorMessage = error.response?.data?.detail || error.message;
    return res.json({
      success: false,
      message: typeof errorMessage === 'string' ? errorMessage : 'An error occurred generating the answer'
    });
  }
};

// Get frequently asked questions
const getFrequentlyAskedQuestions = async (req, res) => {
  try {
    // Aggregate queries to find most frequently asked questions
    const faqs = await queryModel.aggregate([
      {
        $group: {
          _id: {
            question: { $concat: ["$text", " ", { $ifNull: ["$voiceData", ""] }] }
          },
          count: { $sum: 1 },
          shortAnswer: { $first: "$shortAnswer" },
          longAnswer: { $first: "$longAnswer" }
        }
      },
      {
        $match: {
          "_id.question": { $ne: " " } // Exclude empty questions
        }
      },
      {
        $project: {
          _id: 1,
          question: "$_id.question",
          count: 1,
          shortAnswer: 1,
          longAnswer: 1
        }
      },
      {
        $sort: { count: -1 } // Sort by count in descending order
      },
      {
        $limit: 20 // Limit to top 20 questions
      }
    ]);

    return res.json({
      success: true,
      faqs: faqs,
      message: "Frequently asked questions retrieved successfully"
    });

  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return res.json({
      success: false,
      message: 'An error occurred while fetching frequently asked questions'
    });
  }
};

module.exports = { answerQuery, speechToText, generateAnswer, getFrequentlyAskedQuestions };