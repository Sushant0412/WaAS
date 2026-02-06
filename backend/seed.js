const mongoose = require("mongoose");
require("dotenv").config();

const Event = require("./models/Event");

const events = [
  {
    title: "Beach Cleanup Drive",
    place: "Juhu Beach",
    date: "12 Feb 2026",
    fee: "0.01 ETH",
  },
  {
    title: "Plastic Awareness Workshop",
    place: "Bandra Community Hall",
    date: "18 Feb 2026",
    fee: "Free",
  },
  {
    title: "Recycling Hackathon",
    place: "VESIT Auditorium",
    date: "25 Feb 2026",
    fee: "0.02 ETH",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Mongo connected");

    await Event.deleteMany();
    await Event.insertMany(events);

    console.log("Events inserted successfully");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
