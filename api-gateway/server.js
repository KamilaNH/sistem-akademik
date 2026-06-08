const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;

app.use(express.json());

// URL masing-masing service
const STUDENT_SERVICE_URL = process.env.STUDENT_SERVICE_URL || "http://student-service:3001";
const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || "http://course-service:3002";
const ENROLLMENT_SERVICE_URL = process.env.ENROLLMENT_SERVICE_URL || "http://enrollment-service:3003";
const GRADE_SERVICE_URL = process.env.GRADE_SERVICE_URL || "http://grade-service:3004";

// health check gateway
app.get("/health", (req, res) => {
  res.json({ service: "api-gateway", status: "running" });
});

// root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "api-gateway",
    message: "API Gateway - Sistem Akademik",
    endpoints: ["/students", "/courses", "/enrollments", "/grades", "/health"]
  });
});

// teruskan request ke student-service
app.get("/students", async (req, res) => {
  try {
    const response = await fetch(`${STUDENT_SERVICE_URL}/students`);
    const data = await response.json();
    res.json({ gateway: "api-gateway", source: "student-service", result: data });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghubungi Student Service", error: error.message });
  }
});

app.get("/students/:id", async (req, res) => {
  try {
    const response = await fetch(`${STUDENT_SERVICE_URL}/students/${req.params.id}`);
    const data = await response.json();
    res.json({ gateway: "api-gateway", source: "student-service", result: data });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghubungi Student Service", error: error.message });
  }
});

app.post("/students", async (req, res) => {
  try {
    const response = await fetch(`${STUDENT_SERVICE_URL}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json({ gateway: "api-gateway", source: "student-service", result: data });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghubungi Student Service", error: error.message });
  }
});

// teruskan request ke course-service
app.get("/courses", async (req, res) => {
  try {
    const response = await fetch(`${COURSE_SERVICE_URL}/api/v1/courses`);
    const data = await response.json();
    res.json({ gateway: "api-gateway", source: "course-service", result: data });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghubungi Course Service", error: error.message });
  }
});

app.get("/courses/:id", async (req, res) => {
  try {
    const response = await fetch(`${COURSE_SERVICE_URL}/api/v1/courses/${req.params.id}`);
    const data = await response.json();
    res.json({ gateway: "api-gateway", source: "course-service", result: data });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghubungi Course Service", error: error.message });
  }
});

// teruskan request ke enrollment-service
app.get("/enrollments", async (req, res) => {
  try {
    const response = await fetch(`${ENROLLMENT_SERVICE_URL}/enrollments`);
    const data = await response.json();
    res.json({ gateway: "api-gateway", source: "enrollment-service", result: data });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghubungi Enrollment Service", error: error.message });
  }
});

app.post("/enrollments", async (req, res) => {
  try {
    const response = await fetch(`${ENROLLMENT_SERVICE_URL}/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json({ gateway: "api-gateway", source: "enrollment-service", result: data });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghubungi Enrollment Service", error: error.message });
  }
});

// teruskan request ke grade-service
app.get("/grades", async (req, res) => {
  try {
    const response = await fetch(`${GRADE_SERVICE_URL}/grades`);
    const data = await response.json();
    res.json({ gateway: "api-gateway", source: "grade-service", result: data });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghubungi Grade Service", error: error.message });
  }
});

app.post("/grades", async (req, res) => {
  try {
    const response = await fetch(`${GRADE_SERVICE_URL}/grades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json({ gateway: "api-gateway", source: "grade-service", result: data });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghubungi Grade Service", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway berjalan pada port ${PORT}`);
});