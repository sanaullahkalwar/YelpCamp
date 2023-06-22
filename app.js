const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./modals/campground');
const { urlencoded } = require('express');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')

//connect with mongo
mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    // useCreateIndex: true,  // commented because it was not supported.
    useUnifiedTopology: true,
})

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("DB CONNECTED!!!")
})





app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'))

app.engine('ejs',ejsMate)
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));


app.get('/',(req,res)=>{
    res.render('home')
});



app.get('/campgrounds', async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campground/index', {campgrounds})
});


app.get('/campgrounds/new',(req,res)=>{
    res.render('campground/new')
})

app.post('/campgrounds', async (req,res)=>{
    // res.send(req.body)
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)

    // res.redirect('campground/index')
})

app.get('/campgrounds/:id', async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campground/show',{campground})
})

app.get('/campgrounds/:id/edit', async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campground/edit',{campground})
})


app.put('/campgrounds/:id',async (req,res)=>{
    const {id} = req.params;
    const campground =  await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
    // res.send("It worked")
})

app.delete('/campgrounds/:id', async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
})

// app.get('/makecampground',async (req,res)=>{
//     const camp = new Campground({title: 'My Backyard',description:'cheap camping'})
//     await camp.save()
//     res.send(camp)
//     console.log(camp)
// })

app.listen(3000, ()=>{
    console.log("Serving on port 3000")
})