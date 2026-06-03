<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/GradeController.php';

// Inisialisasi tabel jika belum ada
$pdo = getDB();
$pdo->exec("
    CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        nilai REAL NOT NULL,
        grade TEXT NOT NULL,
        semester INTEGER NOT NULL,
        tahun_akademik TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
");

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = trim($uri, '/');
$segments = explode('/', $uri);

// Health check
if ($uri === 'health') {
    echo json_encode(['service' => 'grade-service', 'status' => 'running']);
    exit;
}

// Route: /grades
if ($segments[0] === 'grades') {
    $id = $segments[1] ?? null;
    $sub = $segments[2] ?? null;

    // GET /grades/student/{student_id}
    if ($method === 'GET' && $id === 'student' && $sub) {
        getGradesByStudent($sub);
    }
    // GET /grades
    elseif ($method === 'GET' && !$id) {
        getGrades();
    }
    // GET /grades/{id}
    elseif ($method === 'GET' && $id) {
        getGradeById($id);
    }
    // POST /grades
    elseif ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        createGrade($body);
    }
    // PUT /grades/{id}
    elseif ($method === 'PUT' && $id) {
        $body = json_decode(file_get_contents('php://input'), true);
        updateGrade($id, $body);
    }
    // DELETE /grades/{id}
    elseif ($method === 'DELETE' && $id) {
        deleteGrade($id);
    }
    else {
        http_response_code(405);
        echo json_encode(['message' => 'Method tidak diizinkan']);
    }
} else {
    http_response_code(404);
    echo json_encode(['message' => 'Route tidak ditemukan']);
}