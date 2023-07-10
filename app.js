const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./modals/campground");
const { urlencoded } = require("express");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const AppError = require("./AppError");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const { stat } = require("fs");
const Joi = require("joi");

//connect with mongo
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  // useCreateIndex: true,  // commented because it was not supported.
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("DB CONNECTED!!!");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campground/index", { campgrounds });
  })
);

app.get("/campgrounds/new", (req, res) => {
  res.render("campground/new");
});

app.post(
  "/campgrounds",
  catchAsync(async (req, res, next) => {
    const campgroundSchema = Joi.object({
      campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
      }).required(),
    });

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((element) => element.message).join(",");
      throw new ExpressError(msg, 400);
    }
    console.log(result);

    // if (!req.body.campground)
    //   throw new ExpressError("Invalid Campground Data", 400);
    // res.send(req.body)
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

    // res.redirect('campground/index')
  })
);

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      return next(new AppError("No Campground Found", 500));
    }
    res.render("campground/show", { campground });
  })
);

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campground/edit", { campground }); //edit form mein data show nathi thy.
  })
);

app.put(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
    // res.send("It worked")
  })
);

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

// app.get('/makecampground',async (req,res)=>{
//     const camp = new Campground({title: 'My Backyard',description:'cheap camping'})
//     await camp.save()
//     res.send(camp)
//     console.log(camp)
// })

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found!!", 404));
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "Oh No, Something went wrong!";
  res.status(status).render("error", { err });
  //res.status(status).send(message);
  // res.send("Oh boy something went wrong!");
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
