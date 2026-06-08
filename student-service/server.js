const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3001;

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongodb:27017/db_student";

app.use(express.json());

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB terhubung"))
  .catch((err) => console.log("Gagal koneksi MongoDB:", err.message));

const mahasiswaSchema = new mongoose.Schema({
  nim: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  prodi: { type: String, required: true },
  angkatan: { type: Number, required: true },
  status: { type: String, default: "aktif" }
}, { timestamps: true });

const Mahasiswa = mongoose.model("Mahasiswa", mahasiswaSchema);

app.get("/health", (req, res) => {
  res.json({ service: "student-service", status: "running" });
});

app.get("/students", async (req, res) => {
  try {
    const data = await Mahasiswa.find();
    res.json({ service: "student-service", data: data });
  } catch (error) {
    res.status(500).json({ service: "student-service", message: "Gagal mengambil data", error: error.message });
  }
});

app.get("/students/nim/:nim", async (req, res) => {
  try {
    const data = await Mahasiswa.findOne({ nim: req.params.nim });
    if (!data) return res.status(404).json({ service: "student-service", message: "Mahasiswa tidak ditemukan" });
    res.json({ service: "student-service", data: data });
  } catch (error) {
    res.status(500).json({ service: "student-service", message: "Gagal mengambil data", error: error.message });
  }
});

app.get("/students/:id", async (req, res) => {
  try {
    const data = await Mahasiswa.findById(req.params.id);
    if (!data) return res.status(404).json({ service: "student-service", message: "Mahasiswa tidak ditemukan" });
    res.json({ service: "student-service", data: data });
  } catch (error) {
    res.status(500).json({ service: "student-service", message: "Gagal mengambil data", error: error.message });
  }
});

app.post("/students", async (req, res) => {
  try {
    const { nim, nama, email, prodi, angkatan, status } = req.body;
    if (!nim || !nama || !email || !prodi || !angkatan) {
      return res.status(400).json({ service: "student-service", message: "nim, nama, email, prodi, angkatan wajib diisi" });
    }
    const mahasiswaBaru = new Mahasiswa({ nim, nama, email, prodi, angkatan, status });
    const simpan = await mahasiswaBaru.save();
    res.status(201).json({ service: "student-service", message: "Mahasiswa berhasil ditambahkan", data: simpan });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ service: "student-service", message: "NIM atau email sudah terdaftar" });
    }
    res.status(500).json({ service: "student-service", message: "Gagal menambahkan mahasiswa", error: error.message });
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    const data = await Mahasiswa.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ service: "student-service", message: "Mahasiswa tidak ditemukan" });
    res.json({ service: "student-service", message: "Data berhasil diperbarui", data: data });
  } catch (error) {
    res.status(500).json({ service: "student-service", message: "Gagal memperbarui data", error: error.message });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    const data = await Mahasiswa.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ service: "student-service", message: "Mahasiswa tidak ditemukan" });
    res.json({ service: "student-service", message: "Mahasiswa berhasil dihapus", data: data });
  } catch (error) {
    res.status(500).json({ service: "student-service", message: "Gagal menghapus data", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Student Service berjalan pada port ${PORT}`);
});