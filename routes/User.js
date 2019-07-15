const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const passport = require("passport");

router.get('/login', (req, res) => {
	res.render('login');
});

router.get('/register', (req, res) => {
	res.render('register');
});

router.post('/register', (req, res) => {
	const { name, email, password, password2 } = req.body;
	let errors = [];
	if (!name || !email || !password || !password2) {
		errors.push({ msg: `Please fill all the fields` });
	}

	if (password != password2) {
		errors.push({ msg: `password do not match` });
	}

	if (password.length < 6) {
		errors.push({ msg: `Password must be 6 or more characters` });
	}

	if (errors.length > 0) {
		res.render('register', {
			errors,
			name,
			email,
			password,
			password2
		});
	} else {
		User.findOne({ email: email }).then((user) => {
			if (user) {
				console.log(user);
				errors.push({ msg: `Username with this Email already exists` });
				res.render('register', {
					errors,
					name,
					email,
					password,
					password2
				});
			} else {
				const newUser = new User({
					name,
					email,
					password
				});

                bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) {
                            throw err;
                        } else { 
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash("success_msg", "You are registerd now you can login");
                                    res.redirect("/users/login")
                                })
                                .catch(err=> console.log(`error ${err}`))
                        }
                }));
			}
		});
	}
});

// login
router.post("/login", (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/dashboard',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next)
});

router.get("/logout", (req, res) => { 
	req.logout();
	req.flash("success_msg", "Successfully Logout");
	res.redirect("/users/login");
})

module.exports = router;
