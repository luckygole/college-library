// const Listing = require("./models/listing");

const feedback = require("./models/feedback");
const { findById } = require("./models/feedback");

// its is check is user login or not
module.exports.isloggedIn = (req , res , next) =>{
  console.log(req.user)
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        console.log("you must be logged in ")
        req.flash("error","You must be logged in to submit feedback!")
        return res.redirect("/home");
      }
      next();
} 
 
//its use for redirect to user wanted pages
module.exports.saveRedirectUrl = (req, res , next) =>{
  if(req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}

//its is for authorization for edit delete update routes in listings.js file
// module.exports.isOwned = async ( req , res ,next) => {
//   let { id } = req.params;
//   let listing = await Listing.findById(id); 
//   if(!listing.owner.equals(res.locals.currUser._id)) {
//     req.flash("error", "You are not owner of this listing!");
//     return res.redirect(`/listings/${id}`);
//   }
//   next();
// }

module.exports.isdeletefeedback = async(req , res, next) =>{
  let { id } = req.params;
  let isdeletedfeedback = await feedback.findById(id)
  if(!isdeletedfeedback.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not onwer of this feedback");
    return res.redirect("/home")
  }
  next();
}