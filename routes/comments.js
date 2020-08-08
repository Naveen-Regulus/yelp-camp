var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware")


// Comments new
router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id)
    .then(campground => {
        console.log(campground)
        res.render("comments/new", {campground: campground})
    })
    .catch(err => console.log(err))
});

// Comments save
router.post("/", middleware.isLoggedIn, function(req, res){
    var comment = req.body.comment
    Campground.findById(req.params.id)
    .then(campground => {
        Comment.create(comment)
        .then(comment => {
            // add username and id of the User model to Comment
            comment.author.id = req.user._id
            comment.author.username = req.user.username
            comment.save()
            // save comment
            campground.comments.push(comment)
            campground.save()
            .then(campground => {
                req.flash("success", "Successfully created comment")
                res.redirect(`/campgrounds/${req.params.id}`)
            })
            .catch(err => {
                console.log(err)
                res.redirect("/campgrounds")
            })
        })
        .catch(err => {
            req.flash("error", "Something went wrong with the Database")
            res.redirect("/campgrounds")
        })
    })
    .catch(err => {
        console.log(err)
        res.redirect("/campgrounds")
    })
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if (err || !campground) {
            req.flash("error", "No Campground found")
            return res.redirect("back")
        }
        Comment.findById(req.params.comment_id)
        .then(comment => {
            if (!comment) {
                req.flash("error", "Comment not found")
                return res.redirect("back")
            }
            res.render("comments/edit", {
                campground_id: req.params.id,
                comment: comment
            })  
        })
        .catch(err => {
            console.log(err)
            req.flash("error", "Comment not found")
            res.redirect("back")
        })
    })
})

router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment)
    .then(comment => {
        if (!comment) {
            req.flash("error", "Comment not found")
            return res.redirect("back")
        }
        console.log(comment)
        res.redirect(`/campgrounds/${req.params.id}`)
    })
    .catch(err => {
        console.log(err)
        req.flash("error", "Comment not found")
        res.redirect("back")
    })
})

router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id)
    .then(comment => {
        req.flash("success", "Comment Deleted")
        res.redirect(`/campgrounds/${req.params.id}`)
    })
    .catch(err => {
        console.log(err)
        res.redirect("back")
    })
})

module.exports = router;