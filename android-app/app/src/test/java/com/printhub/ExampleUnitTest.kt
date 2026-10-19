package com.printhub

import org.junit.Assert.*
import org.junit.Test

/**
 * Example local unit test for PrintHub.
 * GitHub Actions will run these on every push.
 */
class ExampleUnitTest {
    @Test
    fun addition_isCorrect() {
        assertEquals(4, 2 + 2)
    }

    @Test
    fun password_min_length() {
        val password = "Password123!"
        assertTrue("Password should be at least 6 characters", password.length >= 6)
    }

    @Test
    fun order_status_valid() {
        val valid = setOf("pending", "confirmed", "in_production", "ready", "shipped", "completed", "cancelled")
        assertTrue(valid.contains("pending"))
        assertFalse(valid.contains("unknown"))
    }
}
