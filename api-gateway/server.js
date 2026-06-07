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

// =====================================================
// HEALTH CHECK
// Cek status semua service sekaligus
// =====================================================
app.get("/health", (req, res) => {
  res.json({ service: "api-gateway", status: "running" });
});

app.get("/health-check", async (req, res) => {
  const services = [
    { name: "student-service", url: `${STUDENT_SERVICE_URL}/health` },
    { name: "course-service", url: `${COURSE_SERVICE_URL}/health` },
    { name: "enrollment-service", url: `${ENROLLMENT_SERVICE_URL}/health` },
    { name: "grade-service", url: `${GRADE_SERVICE_URL}/health` },
  ];

  const results = await Promise.all(
    services.map(async (s) => {
      try {
        const r = await fetch(s.url);
        const json = await r.json();
        return { service: s.name, status: json.status || "running" };
      } catch {
        return { service: s.name, status: "down" };
      }
    })
  );

  res.json(results);
});

// =====================================================
// STUDENT ROUTES
// Forward ke student-service
// =====================================================
app.get("/students", async (req, res) => {
  const r = await fetch(`${STUDENT_SERVICE_URL}/students`);
  const json = await r.json();
  res.status(r.status).json(json);
});

app.get("/students/nim/:nim", async (req, res) => {
  const r = await fetch(`${STUDENT_SERVICE_URL}/students/nim/${req.params.nim}`);
  const json = await r.json();
  res.status(r.status).json(json);
});

app.get("/students/:id", async (req, res) => {
  const r = await fetch(`${STUDENT_SERVICE_URL}/students/${req.params.id}`);
  const json = await r.json();
  res.status(r.status).json(json);
});

app.post("/students", async (req, res) => {
  const r = await fetch(`${STUDENT_SERVICE_URL}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body)
  });
  const json = await r.json();
  res.status(r.status).json(json);
});

app.put("/students/:id", async (req, res) => {
  const r = await fetch(`${STUDENT_SERVICE_URL}/students/${req.params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body)
  });
  const json = await r.json();
  res.status(r.status).json(json);
});

app.delete("/students/:id", async (req, res) => {
  const r = await fetch(`${STUDENT_SERVICE_URL}/students/${req.params.id}`, {
    method: "DELETE"
  });
  const json = await r.json();
  res.status(r.status).json(json);
});

// =====================================================
// COURSE ROUTES
// Forward ke course-service
// =====================================================
app.get("/api/v1/courses", async (req, res) => {
  const r = await fetch(`${COURSE_SERVICE_URL}/api/v1/courses`);
  const json = await r.json();
  res.status(r.status).json(json);
});

app.get("/api/v1/courses/:id", async (req, res) => {
  const r = await fetch(`${COURSE_SERVICE_URL}/api/v1/courses/${req.params.id}`);
  const json = await r.json();
  res.status(r.status).json(json);
});

app.post("/api/v1/courses", async (req, res) => {
  const r = await fetch(`${COURSE_SERVICE_URL}/api/v1/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body)
  });
  const json = await r.json();
  res.status(r.status).json(json);
});

app.put("/api/v1/courses/:id", async (req, res) => {
  const r = await fetch(`${COURSE_SERVICE_URL}/api/v1/courses/${req.params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body)
  });
  const json = await r.json();
  res.status(r.status).json(json);
});

app.delete("/api/v1/courses/:id", async (req, res) => {
  const r = await fetch(`${COURSE_SERVICE_URL}/api/v1/courses/${req.params.id}`, {
    method: "DELETE"
  });
  const json = await r.json();
  res.status(r.status).json(json);
});

// =====================================================
// ENROLLMENT ROUTES
// Forward ke enrollment-service
// =====================================================
app.get("/enrollments", async (req, res) => {
  const r = await fetch(`${ENROLLMENT_SERVICE_URL}/enrollments`);
  const json = await r.json();
  res.status(r.status).json(json);
});

app.get("/enrollments/student/:studentId", async (req, res) => {
  const r = await fetch(`${ENROLLMENT_SERVICE_URL}/enrollments/student/${req.params.studentId}`);
  const json = await r.json();
  res.status(r.status).json(json);
});

app.get("/enrollments/:id", async (req, res) => {
  const r = await fetch(`${ENROLLMENT_SERVICE_URL}/enrollments/${req.params.id}`);
  const json = await r.json();
  res.status(r.status).json(json);
});

app.post("/enrollments", async (req, res) => {
  const r = await fetch(`${ENROLLMENT_SERVICE_URL}/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body)
  });
  const json = await r.json();
  res.status(r.status).json(json);
});

app.put("/enrollments/:id", async (req, res) => {
  const r = await fetch(`${ENROLLMENT_SERVICE_URL}/enrollments/${req.params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body)
  });
  const json = await r.json();
  res.status(r.status).json(json);
});

app.delete("/enrollments/:id", async (req, res) => {
  const r = await fetch(`${ENROLLMENT_SERVICE_URL}/enrollments/${req.params.id}`, {
    method: "DELETE"
  });
  const json = await r.json();
  res.status(r.status).json(json);
});

// =====================================================
// GRADE ROUTES
// Forward ke grade-service
// =====================================================
app.get("/grades", async (req, res) => {
  const r = await fetch(`${GRADE_SERVICE_URL}/grades`);
  const json = await r.json();
  res.status(r.status).json(json);
});

app.get("/grades/student/:studentId", async (req, res) => {
  const r = await fetch(`${GRADE_SERVICE_URL}/grades/student/${req.params.studentId}`);
  const json = await r.json();
  res.status(r.status).json(json);
});

app.get("/grades/:id", async (req, res) => {
  const r = await fetch(`${GRADE_SERVICE_URL}/grades/${req.params.id}`);
  const json = await r.json();
  res.status(r.status).json(json);
});

app.post("/grades", async (req, res) => {
  const r = await fetch(`${GRADE_SERVICE_URL}/grades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body)
  });
  const json = await r.json();
  res.status(r.status).json(json);
});

app.put("/grades/:id", async (req, res) => {
  const r = await fetch(`${GRADE_SERVICE_URL}/grades/${req.params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body)
  });
  const json = await r.json();
  res.status(r.status).json(json);
});

app.delete("/grades/:id", async (req, res) => {
  const r = await fetch(`${GRADE_SERVICE_URL}/grades/${req.params.id}`, {
    method: "DELETE"
  });
  const json = await r.json();
  res.status(r.status).json(json);
});

// =====================================================
// ROOT
// =====================================================
app.get("/", (req, res) => {
  res.json({
    service: "api-gateway",
    message: "API Gateway - Sistem Akademik (Port 3000)",
    endpoints: {
      health: "/health",
      health_check: "/health-check",
      students: "/students",
      courses: "/api/v1/courses",
      enrollments: "/enrollments",
      grades: "/grades"
    }
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway berjalan pada port ${PORT}`);
});