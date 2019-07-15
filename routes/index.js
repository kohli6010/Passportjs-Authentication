const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("welcome");
})

router.get("/dashboard", ensureAuthenticated, (req, res) => { 
    res.render("dashboard", {
        name: req.user.name
    });
})

function ensureAuthenticated(req, res, next) { 
    console.log("Reached to ensureAuthenticated");
    if (req.isAuthenticated) { 
        return next();
    }

    req.flash("error_msg", "You need to login first");
    res.redirect("/users/login");
}

module.exports = router;