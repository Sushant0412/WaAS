const router = require("express").Router();
const Registration = require("../models/Registration");

router.post("/", async (req, res) => {
  const registration = await Registration.create(req.body);
  res.json(registration);
});

router.put("/approve/:id", async (req, res) => {
  const { message } = req.body;

  const registration = await Registration.findByIdAndUpdate(
    req.params.id,
    {
      status: "approved",
      adminMessage: message,
    },
    { new: true },
  );

  res.json(registration);
});

router.get("/user/:wallet", async (req, res) => {
  const data = await Registration.find({
    walletAddress: req.params.wallet,
  }).populate("eventId");

  res.json(data);
});

module.exports = router;
