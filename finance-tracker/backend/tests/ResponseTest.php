<?php
use PHPUnit\Framework\TestCase;

class ResponseTest extends TestCase
{
    public function testSuccessResponseFormat()
    {
        $response = [
            "status" => "success",
            "message" => "Data fetched",
            "data" => []
        ];

        $this->assertArrayHasKey("status", $response);
        $this->assertArrayHasKey("message", $response);
        $this->assertArrayHasKey("data", $response);
    }

    public function testErrorResponseFormat()
    {
        $response = [
            "status" => "error",
            "message" => "Something went wrong"
        ];

        $this->assertEquals("error", $response["status"]);
    }
}