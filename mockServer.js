const express = require("express");
const app = express();

app.get("/process", (req, res) => {
  const { code, state } = req.query;
  res.send(`Authorization Code: ${code}, State: ${state}`);
});

app.listen(8081, () => {
  console.log("Mock server running on http://localhost:8081");
});
