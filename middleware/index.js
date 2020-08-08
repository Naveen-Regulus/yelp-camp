var Campground = require("../models/campground")
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, campground){
            if(err || !campground) {
                req.flash("error", "Campground not found")
            } else {
                // Since, campground.author.id is an object and req.user._id is a string.
                // Hence, using the method provided by mongoose.
                if(campground.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that")
                    res.redirect("/campgrounds/" + req.params.id);
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that")
        res.redirect("/login");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, comment) {
            if(err || !comment) {
                req.flash("error", "Campground not found")
                res.redirect("/campgrounds")
            } else {
                // Since, comment.author.id is an object and req.user._id is a string.
                // Hence, using the method provided by mongoose.
                if (comment.author.id.equals(req.user._id)) {
                    next();
                }
                else {
                    req.flash("error", "You don't have permission to do that")
                    res.redirect("back");
                }
            }
        });
    }
    else {
        req.flash("error", "You need to be logged in to do that")
        res.redirect("/login");
    }
}

middlewareObj.isLoggedIn = function (req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    req.flash("error", "You need to be logged in to do that")
    res.redirect("/login");
}

module.exports = middlewareObj
