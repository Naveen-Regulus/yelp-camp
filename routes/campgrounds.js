var express = require("express")
var router = express.Router();
var Campground = require("../models/campground")
var middleware = require("../middleware")

// INDEX route
router.get("/", function(req, res){
    Campground.find()
        .then(campgrounds => {
            // console.log(campgrounds)
            res.render("campgrounds/index", {
                campgrounds: campgrounds
            });
            }
        )
        .catch(err => console.log(err))
});

// CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    Campground.create({
        name: name,
        price: price,
        image: image,
        description: description,
        author: author
    })
    .then(campground => console.log(campground))
    .catch(err => console.log(err))

    // Default HTTP method for redirect is GET.
    res.redirect("campgrounds");
});

// NEW ROUTE
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new")
});

// SHOW ROUTE
router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec()
    .then(campground => {
        if (!campground) {
            req.flash("error", "Campground not found")
            return res.redirect("back")
        }
        console.log(campground)
        res.render("campgrounds/show", {campground: campground})
    })
    .catch(err => {
        console.log(err)
        req.flash("error", "Campground not found")
        res.redirect("/campgrounds")
    })
});

// Edit Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id)
    .then(campground => {
        console.log(campground)
        res.render("campgrounds/edit", {campground: campground})
    })
    .catch(err => console.log(err))
});

router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    var campground = req.body.campground
    Campground.findByIdAndUpdate(req.params.id, campground)
    .then(campground => {
        console.log(campground)
        res.redirect("/campgrounds/" + req.params.id)
    })
    .catch(err => console.log(err))
})

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id)
    .then(campground => {
        console.log(campground)
        res.redirect("/campgrounds")
    })
    .catch(err => console.log(err))
})

module.exports = router;
