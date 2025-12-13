// backend/server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(bodyParser.json());

let templates = [
  {
    id: 1,
    name: "Contract A",
    content: "<p>Hello {{name}}</p>",
    fields: [{ name: "name", type: "text", sample: "John Doe" }],
  },
  {
    id: 2,
    name: "Agreement B",
    content: "<p>Dear {{company}}</p>",
    fields: [{ name: "company", type: "text", sample: "Acme Ltd." }],
  },
];

let users = [
  { id: "u1", displayName: "Alice Johnson", email: "alice@example.com" },
  { id: "u2", displayName: "Bob Kumar", email: "bob@example.com" },
  { id: "u3", displayName: "Charlie Smith", email: "charlie@example.com" },
  { id: "u4", displayName: "Diana Petra", email: "diana@example.com" },
];

// Templates
app.get("/templates", (req, res) => res.json(templates));
app.get("/templates/:id", (req, res) => {
  const t = templates.find((x) => x.id === +req.params.id);
  res.json(t || null);
});
app.post("/templates", (req, res) => {
  const nt = { id: Date.now(), ...req.body };
  templates.push(nt);
  res.json(nt);
});
app.put("/templates/:id", (req, res) => {
  const id = +req.params.id;
  templates = templates.map((t) => (t.id === id ? { ...t, ...req.body } : t));
  res.json(templates.find((t) => t.id === id));
});
app.delete("/templates/:id", (req, res) => {
  const id = +req.params.id;
  templates = templates.filter((t) => t.id !== id);
  res.json({ success: true });
});

// Users search for mentions
app.get("/users", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  if (!q) return res.json(users.slice(0, 10));
  const filtered = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
  );
  res.json(filtered);
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Mock API running at http://localhost:${PORT}`)
);
