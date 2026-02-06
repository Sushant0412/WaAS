const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/events", require("./routes/eventRoutes"));
app.use("/register", require("./routes/registrationRoutes"));

app.listen(process.env.PORT, () =>
  console.log("Server is running on port 5000"),
);
