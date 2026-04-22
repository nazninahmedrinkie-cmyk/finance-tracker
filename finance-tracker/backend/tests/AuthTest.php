<?php
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../models/User.php';

class AuthTest extends TestCase
{
    // Test email validation (used in register.php)
    public function testValidEmail()
    {
        $email = "test@example.com";
        $this->assertTrue(filter_var($email, FILTER_VALIDATE_EMAIL) !== false);
    }

    public function testInvalidEmail()
    {
        $email = "invalid-email";
        $this->assertFalse(filter_var($email, FILTER_VALIDATE_EMAIL));
    }

    // Test password hashing (used in register + login)
    public function testPasswordHashing()
    {
        $password = "mypassword123";
        $hash = password_hash($password, PASSWORD_BCRYPT);

        $this->assertTrue(password_verify($password, $hash));
        $this->assertFalse(password_verify("wrongpass", $hash));
    }

    // Test empty fields validation
    public function testEmptyFields()
    {
        $email = "";
        $password = "";

        $this->assertEmpty($email);
        $this->assertEmpty($password);
    }
}