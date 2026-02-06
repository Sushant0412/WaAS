const router = require("express").Router();
const Event = require("../models/Event");

router.post("/", async (req, res) => {
  const event = await Event.create(req.body);
  res.json(event);
});

router.get("/", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

module.exports = router;
