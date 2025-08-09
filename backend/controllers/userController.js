const bcrypt = require('bcrypt');
const userModel = require('../models/User');
const { generateToken } = require('../middleware/auth');

const signup = async (req, res) => {
    try {
        const { language, phoneNo, password } = req.body;

        const existingUser = await userModel.findOne({ phoneNo });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await userModel.create({
            language,
            phoneNo,
            password: hashedPassword
        });

        const token = generateToken(newUser._id);
        res.cookie("token", token, {
            httpOnly: true,
        });

        return res.json({ success: true, user: newUser, message: "User registered successfully" });

    } catch (error) {
        console.error(error.message);
        return res.json({ success: false, message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { number, password } = req.body;

        const user = await userModel.findOne({ phoneNo: number });
        if (!user) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const token = generateToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
        });

        return res.json({ success: true, user, message: "Logged in successfully" });

    } catch (error) {
        console.error(error.message);
        return res.json({ success: false, message: error.message });
    }
};

const checkAuth = (req, res) => {
    return res.json({ success: true, user: req.user });
};

const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error(error.message);
        return res.json({ success: false, message: error.message });
    }
};

const accountActivation = async (req, res) => {
    try {
        
        const userId = req.user._id;

        const { accountNo, ifscCode, branch } = req.body;
        const user = await userModel.findOneAndUpdate({ _id: userId }, {
            accountNo,
            ifscCode,
            branch,
            isLinked: true
        }, {new: true})

        return res.json({ success: true, user, message: "Account activated successfully" });

    } catch (error) {
        console.error(error.message);
        return res.json({ success: false, message: error.message });
    }
}

module.exports = { signup, login, checkAuth, logout, accountActivation };