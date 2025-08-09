const express = require('express');
const { signup, login, checkAuth, logout, accountActivation } = require('../controllers/userController');
const { protectedRoute } = require('../middleware/auth');

const userRoutes = express.Router();

userRoutes.post("/signup", signup);
userRoutes.post("/login", login);
userRoutes.get("/check", protectedRoute, checkAuth);
userRoutes.post("/logout", protectedRoute, logout);
userRoutes.post("/account-activate", protectedRoute, accountActivation);

module.exports = userRoutes;