<?php

class User {
    private $conn;
    private $table = "users";

    public function __construct($db) {
        $this->conn = $db;
    }

    // REGISTER 
    public function register($name, $email, $password) {
        try {
            // Checking if email already exists
            $checkQuery = "SELECT id FROM {$this->table} WHERE email = :email LIMIT 1";
            $checkStmt  = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(":email", $email);
            $checkStmt->execute();

            if ($checkStmt->rowCount() > 0) {
                return "exists";
            }

            // Inserting new user
            $query = "INSERT INTO {$this->table} (name, email, password)
                      VALUES (:name, :email, :password)";
            $stmt  = $this->conn->prepare($query);

            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            $stmt->bindParam(":name",     $name);
            $stmt->bindParam(":email",    $email);
            $stmt->bindParam(":password", $hashedPassword);

            if ($stmt->execute()) {
                return "success";
            }
            return "error";

        } catch (PDOException $e) {

            return "error";
        }
    }

    //  LOGIN 
    public function login($email, $password) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE email = :email LIMIT 1";
            $stmt  = $this->conn->prepare($query);
            $stmt->bindParam(":email", $email);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return false;
            }

            if (password_verify($password, $user['password'])) {
                return $user;
            }

            return false;

        } catch (PDOException $e) {
            return false;
        }
    }
}
?>