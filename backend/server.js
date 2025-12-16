const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = 3000;

/* ===============================
   PATHS
================================ */
const dbPath = path.join(__dirname, "db.json");
const uploadDir = path.join(__dirname, "uploads");

/* ===============================
   ENSURE FILES / FOLDERS EXIST
================================ */
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ templates: [] }, null, 2));
}

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

/* ===============================
   HELPERS
================================ */
function readDB() {
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

/* ===============================
   FILE UPLOAD CONFIG
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* ===============================
   ROUTES
================================ */

// Root test
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

/* ===============================
   UPLOAD API
================================ */
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    fileUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`,
  });
});

/* ===============================
   TEMPLATES API
================================ */

// GET all templates
app.get("/templates", (req, res) => {
  const db = readDB();
  res.json(db.templates);
});

// GET template by ID
app.get("/templates/:id", (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  const template = db.templates.find((t) => t.id === id);

  if (!template) {
    return res.status(404).json({ error: "Template not found" });
  }

  res.json(template);
});

// CREATE template
app.post("/templates", (req, res) => {
  const db = readDB();

  const newTemplate = {
    id: Date.now(),
    ...req.body,
  };

  db.templates.push(newTemplate);
  writeDB(db);

  res.status(201).json(newTemplate);
});

// UPDATE template
app.put("/templates/:id", (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);

  const index = db.templates.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Template not found" });
  }

  db.templates[index] = { ...db.templates[index], ...req.body };
  writeDB(db);

  res.json(db.templates[index]);
});

// DELETE template
app.delete("/templates/:id", (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);

  const index = db.templates.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Template not found" });
  }

  db.templates.splice(index, 1);
  writeDB(db);

  res.json({ success: true });
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
