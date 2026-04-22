<?php

class Database {
    private $host     = "localhost";
    private $db_name  = "finance_tracker";   
    private $username = "root";
    private $password = "root";                 
    private $conn;

    public function connect() {
        $this->conn = null;
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            // Sending a clean JSON error instead of crashing
            header("Content-Type: application/json");
            echo json_encode([
                "status"  => "error",
                "message" => "Database connection failed: " . $e->getMessage()
            ]);
            exit();
        }
        return $this->conn;
    }
}
?>