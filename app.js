if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const feedback = require("./models/feedback.js");
const Semester = require("./models/semester.js");
const Subject = require("./models/subject.js");
const Note = require("./models/note.js");
const path = require("path");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const Localstrategy = require("passport-local");
const User = require("./models/user.js");
const userRoute = require("./routes/user.js");
const { isloggedIn , isdeletefeedback } = require("./middleware.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/learning-website";
// const dburl = "mongodb+srv://golelaksh:vHnM3RnJRCzHKhok@cluster0.n8wlz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const db_url = process.env.ATLASDB_DB

main()
  .then(() => {
    console.log("connected to DB");
    
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(db_url);
}

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Define the path for the uploads directory inside public folder
const uploadsDir = path.join(__dirname, "public", "uploads");


const store = MongoStore.create({
  mongoUrl : db_url,
  crypto : {
    secret : process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () =>{
  console.log("error in mongo session store" , err);
});

const sessionOptions = {
  store,
  secret : process.env.SECRET,
  unsave : false,
  saveUninitializad : true,
  Cookie:{
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true,
  }
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req , res , next) =>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  console.log(req.user);
  res.locals.currUser = req.user;
  next();
})

app.use("/",userRoute);

// Check if the uploads directory exists, if not, create it
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // Create uploads directory
}

// Set up storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Set destination for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  },
});

// Initialize multer with the defined storage configuration
const upload = multer({ storage });

//home route and here we sending feedback and semester data to home page//
app.get("/home", async (req, res) => {
  req.flash("success","welcome to home page");
  const semesters = await Semester.find();
  const feedbackList = await feedback.find({}).sort({ _id: -1 }).populate("owner"); // Sort by _id to show latest feedback first
  // console.log(feedbackList);
  res.render("home.ejs", { semesters ,  feedbackList });
});

//about page
app.get("/about", (req, res) => {
  req.flash("success","welcome to about page")
  res.render("about.ejs");
});

//Edit Route
// app.get("/home/:id/edit", async (req, res) => {
//   let { id } = req.params;
//   const syllabus = await Subject.findById(id);
//   res.render("edit.ejs", { syllabus });
// });

//Update Route
app.put("/home/:id", async (req, res) => {
  let { id } = req.params;
  await Syllabus.findByIdAndUpdate(id, { ...req.body.syllabu });
  res.redirect(`/home/${id}`);
});

//Delete Route for deleting feedback//
app.delete("/home/:id", isdeletefeedback, async (req, res) => {
  let { id } = req.params;
  let deletedfeedback = await feedback.findByIdAndDelete(id);
  req.flash("success" , "feedback deleted successfully")
  console.log(" feedback deleted successfully",deletedfeedback);
  res.redirect("/home");
});

//delete route for subject delete in semester//
app.delete("/home/:id/subject" , async (req ,res) =>{
  let {id} = req.params;
  let deletedListing = await Subject.findByIdAndDelete(id);
  console.log("subject deleted successfully", deletedListing);
  res.redirect("/home");
})

// New semester
app.get("/home/index", (req, res) => {
  res.render("index.ejs");
});

//add semester route//
app.post("/add-semester", async (req, res) => {
  const { name } = req.body;
  const newSemester = new Semester({ name });
  await newSemester.save();
  console.log(newSemester);
  res.redirect("/home");
});

// feedback route
app.post("/home" , isloggedIn ,async (req, res) => {
  try{
    let { email , content , owner} = req.body;
    let allfeedback = new feedback({
        email:email,
        content:content,
        owner:owner,
        create_at : new Date(),
    })
    allfeedback.owner = req.user._id;
    await allfeedback.save();
    const { username } =  req.user;

    req.flash("success",`Feedback submitted.Thank-You ${username }` );
    res.redirect("/home");

  } catch(e){
    console.log(e)
    req.flash("error","failed to submit feedback")
    res.redirect("/home");
  }
});

//View subjects for a specific semester
app.get("/semester/:id", async (req, res) => {
  const semester = await Semester.findById(req.params.id).populate("subjects");
  res.render("semester.ejs", { semester });
});

// Route to handle adding a subject to a semester
app.post("/semester/:id/add-subject", async (req, res) => {
  const { name } = req.body;
  const semester = await Semester.findById(req.params.id);

  const newSubject = new Subject({ name, semesterId: semester._id });
  await newSubject.save();

  semester.subjects.push(newSubject);
  await semester.save();

  res.redirect(`/semester/${semester._id}`);
});

// View notes for a specific subject
app.get("/subject/:id", async (req, res) => {
  const subject = await Subject.findById(req.params.id)
    .populate("notes")
    .populate("semesterId");
  res.render("subject", { subject });
});

app.get("/subject/:id/add", async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  res.render("add", { subject });
});

// Route to add a note to a specific subject
app.post("/subject/:id/add-note", (req, res) => {
  upload.single("pdf")(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "File upload error", error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const { title } = req.body;
    const subject = await Subject.findById(req.params.id);

    const newNote = new Note({
      title: title,
      filename: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      subject: subject._id,
    });

    try {
      await newNote.save();
      subject.notes.push(newNote);
      await subject.save();

      res.redirect(`/subject/${subject._id}`);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error saving PDF", error: error.message });
    }
  });
});

// Handle 404 errors
app.use("*",(req, res) => {
  res.status(404).send("Page not found");
});

app.listen(3000, function (err) {
  if (err) console.log("Error in server setup");
  console.log("Server listening on Port", 3000);
});
