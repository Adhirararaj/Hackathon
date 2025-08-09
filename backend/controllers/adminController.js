const userModel = require('../models/user');
const queryModel = require('../models/query');

const answerQuery = async (req, res) => {
    try {
        
        const { voiceData, text, language } = req.body;
        const pdfFile = req.file;
        
        const apiReq = pdfFile? "/api/adaptive-answer-with-pdf" : "/api/adaptive-answer"

        const question = voiceData + text;

        const { long_answer, short_answer } = await axios.post(`${apiReq}`, question, pdfFile)

        const userId = req.user._id;

        const query = await queryModel.create({
            userId,
            voiceData,
            text,
            language,
            shortAnswer: short_answer,
            longAnswer: long_answer,
            providedDoc: pdfFile
        })


        return res.json({ success: true, query, message: "Answer given" });

    } catch (error) {
        console.error(error.message);
        return res.json({ success: false, message: error.message });
    }
};

module.exports = { answerQuery };