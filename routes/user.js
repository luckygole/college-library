const express = require("express")
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

router.get("/signup", (req,res)=>{
    res.render("signup.ejs")
})

router.post("/signup" , wrapAsync(async(req,res)=>{
    console.log(req.body);
   try{
    let { username , email , password } = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser , password);
    // console.log(registeredUser);
    req.login(registeredUser, (err)=>{
        if(err){
            console.log(err);
            return next(err); 
        }
        req.flash("success", "Welcome to apni library!");
        // console.log(registeredUser)
        res.redirect("/home");
        
    })
    
   } catch(e) {
    req.flash("error",e.message);
    console.log(e)
    res.redirect("/signup");
   }
}))

// login route
router.get("/login" , (req,res)=>{
    res.render("login.ejs")
})

router.post("/login", saveRedirectUrl ,passport.authenticate("local",{failureRedirect: "/login",failureFlash:true}),async(req , res)=>{
    req.flash("success" , "welcome back in apni library!");
    // const { username } = req.user;
    // console.log(username)
    let redirectUrl = res.locals.redirectUrl || "/home";
    // console.log(redirectUrl)
    res.redirect(redirectUrl , );
})

// logout route
router.get("/logout", (req,res,next)=>{ 
    
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("error","You are logout!");
        res.redirect("/home")
    }) 
   
})

module.exports = router;