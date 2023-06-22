const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('../modals/campground');
const { descriptors, places } = require('./seedHelpers');
const cities = require('./cities')



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


const sample = array => array[Math.floor(Math.random()*array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i= 0; i<50; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const c = new Campground({
            location: `${cities[random1000].city} ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quibusdam eligendi laborum, hic error veritatis, quas dolorem voluptatibus quod blanditiis magnam quos incidunt illum odio aspernatur? Animi, praesentium. Quidem, sapiente fuga.',
            price,
        })
        await c.save()
    }
}

seedDB().then(()=>{
    mongoose.connection.close()
})