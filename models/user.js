const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// mongoose.connect("mongodb://127.0.0.1:27017/learning-website");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email : {
        type: String,
        required:true
    },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User" , userSchema);