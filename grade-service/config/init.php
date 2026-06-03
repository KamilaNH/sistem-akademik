<?php
require_once __DIR__ . '/database.php';

function initDB() {
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
    echo "Database berhasil diinisialisasi\n";
}

initDB();