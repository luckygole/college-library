const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// mongoose.connect("mongodb://127.0.0.1:27017/learning-website");

const feedback = mongoose.Schema({
  email: {
    type: String,
    require: true,
  },
  content: {
    type: String,
    require: true,
  },
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
  },
  create_at :{
    type: Date,
    default : "04:26:57 10/11/2024"
  }
});

module.exports = mongoose.model("feedback-database", feedback);


// const MONGO_URL = "mongodb://127.0.0.1:27017/learning-website";

// main()
//   .then(() => {
//     console.log("connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }