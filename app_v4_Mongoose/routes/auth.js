const express = require('express'); 
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassword);

router.post(
    "/login", 
    [
        body("email")
            .isEmail()
            .withMessage("Please enter a valid email")
            .normalizeEmail(),
        body("password", "Invalid email or password")
            .isLength({min: 5})
            .isAlphanumeric()
            .trim(),
    ],
    authController.postLogin
);

router.post(
    "/signup",
    [
        check("email")
            .isEmail()
            .withMessage("Please enter a valid email")
            .custom((value, { req }) => {
                // express-validator will wait for this async code
                return User
                    .findOne({ email: value })
                    .then(userDoc => {
                        if (userDoc) {
                            return Promise.reject("User with this email address already exists. Please use a different one.");
                        }
                    });
            })
            .normalizeEmail(),
        body("password", "Please enter a password of at least 5 characters with only numbers and text")
            .isLength({min: 5})
            .isAlphanumeric()
            .trim(),
        body("confirmPassword")
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("The passwords entered do not match");
                }
                return true;
            }),
    ],
    authController.postSignup
);

router.post("/logout", authController.postLogout);

router.post("/reset", authController.postReset);

router.post('/new-password', authController.postNewPassword);

module.exports = router;