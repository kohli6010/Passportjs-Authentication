const express = require('express');
const app = express();
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');

// Database Connection
mongoose
	.connect('mongodb+srv://rahul:1234@cluster0-wyvbr.mongodb.net/test?retryWrites=true&w=majority', {
		useNewUrlParser: true
	})
	.then(() => console.log('mongodb connection established'))
	.catch(() => console.log('error ocurred'));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// body-parser
app.use(express.urlencoded({ extended: false }));

// session
app.use(
	session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: true
	})
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// flash
app.use(flash());

// global variables
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});

// Passport
passport.use(
	new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
		User.findOne({ email: email }).then((user) => {
			// check User exists
			if (!user) {
				return done(null, false, { message: 'That Email is not registered' });
			}

			// compare passwords
			bcrypt.compare(password, user.password, (err, isMatch) => {
				if (err) throw err;

				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Password Incorrect' });
				}
			});
		});
	})
);

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/User'));

app.listen(3000, () => console.log('server started on port 3000'));
