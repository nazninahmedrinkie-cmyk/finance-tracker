<?php
use PHPUnit\Framework\TestCase;

class TransactionTest extends TestCase
{
    // Amount validation 
    public function testValidAmount()
    {
        $amount = 500;
        $this->assertTrue(is_numeric($amount) && $amount > 0);
    }

    public function testInvalidAmount()
    {
        $amount = -100;
        $this->assertFalse($amount > 0);
    }

    public function testNonNumericAmount()
    {
        $amount = "abc";
        $this->assertFalse(is_numeric($amount));
    }

    // Type validation (income/expense)
    public function testTransactionType()
    {
        $validTypes = ['income', 'expense'];

        $this->assertContains('income', $validTypes);
        $this->assertContains('expense', $validTypes);
        $this->assertNotContains('invalid', $validTypes);
    }

    // Date validation 
    public function testValidDate()
    {
        $date = "2024-01-15";
        $this->assertNotFalse(date_create($date));
    }
}