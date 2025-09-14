if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");

const path = require("path");
const methodOverride = require("method-override");

const ejsMate = require("ejs-mate");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const User= require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter = require("./routes/user.js");

const passport = require("passport");
const LocalStrategy=require("passport-local");

const dbUrl=process.env.ATLASDB_URL;

main()
.then(()=> {
    console.log("Connected to DB");
}).catch((err) => {
    console.error( err); 
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));    
app.use(methodOverride("_method")); // for PUT and DELETE requests
app.engine("ejs", ejsMate); // Use ejsMate for layout support
app.use(express.static(path.join(__dirname, "/public"))); // Serve static files from the public directory

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // time period in seconds
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,   // <-- add this line
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        // secure: true, // uncomment this if you are using HTTPS
    },
};

app.use(session(sessionOptions));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser= new User({
//         email:"nsaisatvika@gmail.com",
//         username:"sigma-student",
//     });
//     let registerdUser = await User.register(fakeUser,"helloWorld");
//     res.send(registerdUser);
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


// middle ware defining
// app.all("/",(req,res,next)=>{
//     next(new ExpressError(404, "Page Not found!"));
// });
app.use((err, req, res, next )=>{

    let {statusCode=500 , message = "Something went wrong"}= err;
    //res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {err});
});



app.listen(8080,()=>{
    console.log("Server is running on port 8080");
});