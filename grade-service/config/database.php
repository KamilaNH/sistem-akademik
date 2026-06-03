<?php

function getDB() {
    $dbPath = __DIR__ . '/../database/grades.db';
    
    // Buat folder database jika belum ada
    if (!is_dir(__DIR__ . '/../database')) {
        mkdir(__DIR__ . '/../database', 0777, true);
    }

    try {
        $pdo = new PDO('sqlite:' . $dbPath);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        die(json_encode(['message' => 'Koneksi database gagal: ' . $e->getMessage()]));
    }
}