const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const { validationResult } = require("express-validator");

const config = require("../config.json");
const User = require("../models/user");

const transporter = nodemailer.createTransport({
    service: config.mail_service,
    auth: {
        user: config.mail_user,
        pass: config.mail_password
    }
});

exports.getLogin = (req, res, next) => {
    const message = req.flash("error");
    const errorMessage = (message.length > 0) ? message[0] : null;
    res.render("auth/login", {
        path: "/login",
        title: "Login",
        errorMessage,
        oldInput: { email: "", password: "" },
        validationErrors: [],
    });
};

exports.getSignup = (req, res, next) => {
    const message = req.flash("error");
    const errorMessage = (message.length > 0) ? message[0] : null;
    res.render('auth/signup', {
      path: '/signup',
      title: 'Signup',
      errorMessage,
      oldInput: { email: "", password: "", confirmPassword: "" },
      validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            title: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: { email, password },
            validationErrors: errors.array(),
        });
    }
    User
        .findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    title: 'Login',
                    errorMessage: "Invalid email or password",
                    oldInput: { email, password },
                    validationErrors: [],
                });
            }
            return bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        // manually call save before redirect to ensure session is updated in store
                        return req.session.save(() => {
                            res.redirect("/");
                        });
                    }
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        title: 'Login',
                        errorMessage: "Invalid email or password",
                        oldInput: { email, password },
                        validationErrors: [],
                    });
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            title: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: { email: email, password: password, confirmPassword: req.body.confirmPassword },
            validationErrors: errors.array()
          });
    }
    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] },
            });
            return user.save();
        })
        .then(result => {
            res.redirect("/login");
            return transporter.sendMail({
                to: email,
                from: config.mail_user,
                subject: "Signup",
                html: "<strong>You successfully signed up. </strong>",
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
};

exports.getReset = (req, res, next) => {
    const message = req.flash("error");
    const errorMessage = (message.length > 0) ? message[0] : null;
    res.render('auth/reset', {
      path: '/reset',
      title: 'Reset Password',
      errorMessage,
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect("/");
        }
        const token = buffer.toString("hex");
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash("error", "No account with that email found.");
                    return res.redirect("/reset");
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 60*60*1000;
                return user.save();
            })
            .then(result => {
                // send email
                res.redirect("/");
                return transporter.sendMail({
                    to: req.body.email,
                    from: config.mail_user,
                    subject: "Signup",
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                    `,
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    });
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }) // $gt - greater than
        .then(user => {
            const message = req.flash("error");
            const errorMessage = (message.length > 0) ? message[0] : null;
            res.render('auth/new-password', {
                path: '/new-password',
                title: 'New Password',
                errorMessage,
                userId: user._id.toString(),
                passwordToken: token,
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
        .then(user => {
            if (!user) {
                
            }
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect("/login");
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}