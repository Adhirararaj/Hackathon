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

module.exports = { answerQuery };