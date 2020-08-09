const campground = require("./models/campground.js");

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash");
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground = require("./models/campground.js"),
    Comment = require("./models/comment.js"),
    User = require("./models/user.js"),
    seedDB = require("./seeds.js");

// requiring ROUTES
var indexRoutes = require("./routes/index")
var campgroudRoutes = require("./routes/campgrounds")
var commentRoutes = require("./routes/comments")

var url = process.env.DATABASE_URL || "mongodb://localhost:27017/yelp_camp"

mongoose.connect(url, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(`${__dirname}/public`));
app.use(methodOverride("_method"));
app.use(flash());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// CUSTOM MIDDLEWARE TO ALL ROUTES
app.use(function(req, res, next){
    // res.locals => Every attributes inside will be available in all templates
    res.locals.currentUser = req.user
    res.locals.error = req.flash("error")
    res.locals.success = req.flash("success")
    next()
})

// ROUTES CONFIGURATION
app.use(indexRoutes)
app.use("/campgrounds", campgroudRoutes)
app.use("/campgrounds/:id/comments", commentRoutes)

// Seed when required. Seeding every time is making the existing/opened pages 
// obsolete since, Mongo is assigning new id for them.
// seedDB();


app.listen(process.env.PORT || 3000, function(){
    console.log("The YelpCamp Server Has Started!");
});
