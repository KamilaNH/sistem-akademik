<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

function getGrades() {
    $pdo = getDB();
    $stmt = $pdo->query("SELECT * FROM grades");
    $data = $stmt->fetchAll();
    echo json_encode(['service' => 'grade-service', 'data' => $data]);
}

function getGradeById($id) {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM grades WHERE id = ?");
    $stmt->execute([$id]);
    $data = $stmt->fetch();
    if (!$data) {
        http_response_code(404);
        echo json_encode(['service' => 'grade-service', 'message' => 'Grade tidak ditemukan']);
        return;
    }
    echo json_encode(['service' => 'grade-service', 'data' => $data]);
}

function getGradesByStudent($student_id) {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM grades WHERE student_id = ?");
    $stmt->execute([$student_id]);
    $data = $stmt->fetchAll();
    echo json_encode(['service' => 'grade-service', 'data' => $data]);
}

function createGrade($body) {
    if (empty($body['student_id']) || empty($body['course_id']) || 
        !isset($body['nilai']) || empty($body['semester']) || empty($body['tahun_akademik'])) {
        http_response_code(400);
        echo json_encode(['service' => 'grade-service', 'message' => 'student_id, course_id, nilai, semester, tahun_akademik wajib diisi']);
        return;
    }

    // Hitung grade otomatis dari nilai
    $nilai = $body['nilai'];
    if ($nilai >= 85) $grade = 'A';
    elseif ($nilai >= 75) $grade = 'B';
    elseif ($nilai >= 65) $grade = 'C';
    elseif ($nilai >= 55) $grade = 'D';
    else $grade = 'E';

    $pdo = getDB();
    $stmt = $pdo->prepare("
        INSERT INTO grades (student_id, course_id, nilai, grade, semester, tahun_akademik)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$body['student_id'], $body['course_id'], $nilai, $grade, $body['semester'], $body['tahun_akademik']]);
    $id = $pdo->lastInsertId();

    $stmt2 = $pdo->prepare("SELECT * FROM grades WHERE id = ?");
    $stmt2->execute([$id]);
    $data = $stmt2->fetch();

    http_response_code(201);
    echo json_encode(['service' => 'grade-service', 'message' => 'Grade berhasil ditambahkan', 'data' => $data]);
}

function updateGrade($id, $body) {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM grades WHERE id = ?");
    $stmt->execute([$id]);
    $data = $stmt->fetch();
    if (!$data) {
        http_response_code(404);
        echo json_encode(['service' => 'grade-service', 'message' => 'Grade tidak ditemukan']);
        return;
    }

    $nilai = $body['nilai'] ?? $data['nilai'];
    if ($nilai >= 85) $grade = 'A';
    elseif ($nilai >= 75) $grade = 'B';
    elseif ($nilai >= 65) $grade = 'C';
    elseif ($nilai >= 55) $grade = 'D';
    else $grade = 'E';

    $stmt2 = $pdo->prepare("
        UPDATE grades SET
            student_id = ?,
            course_id = ?,
            nilai = ?,
            grade = ?,
            semester = ?,
            tahun_akademik = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");
    $stmt2->execute([
        $body['student_id'] ?? $data['student_id'],
        $body['course_id'] ?? $data['course_id'],
        $nilai, $grade,
        $body['semester'] ?? $data['semester'],
        $body['tahun_akademik'] ?? $data['tahun_akademik'],
        $id
    ]);

    $stmt3 = $pdo->prepare("SELECT * FROM grades WHERE id = ?");
    $stmt3->execute([$id]);
    echo json_encode(['service' => 'grade-service', 'message' => 'Grade berhasil diperbarui', 'data' => $stmt3->fetch()]);
}

function deleteGrade($id) {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM grades WHERE id = ?");
    $stmt->execute([$id]);
    $data = $stmt->fetch();
    if (!$data) {
        http_response_code(404);
        echo json_encode(['service' => 'grade-service', 'message' => 'Grade tidak ditemukan']);
        return;
    }
    $pdo->prepare("DELETE FROM grades WHERE id = ?")->execute([$id]);
    echo json_encode(['service' => 'grade-service', 'message' => 'Grade berhasil dihapus', 'data' => $data]);
}