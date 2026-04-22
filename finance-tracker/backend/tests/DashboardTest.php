<?php
use PHPUnit\Framework\TestCase;

class DashboardTest extends TestCase
{
    public function testSummaryCalculation()
    {
        $income = 50000;
        $expense = 20000;

        $savings = $income - $expense;

        $this->assertEquals(30000, $savings);
    }

    public function testSavingsRate()
    {
        $income = 50000;
        $expense = 20000;

        $rate = (($income - $expense) / $income) * 100;

        $this->assertEquals(60, $rate);
    }
}