package com.printhub.data.model

data class User(
    val id: Int,
    val name: String,
    val email: String,
    val role: String,
    val phone: String? = null
)

data class AuthResponse(
    val message: String?,
    val token: String,
    val user: User
)

data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val name: String, val email: String, val password: String, val phone: String? = null)
data class SsoRequest(val email: String, val name: String, val provider: String = "google", val providerId: String? = null)
data class SettingsRequest(
    val name: String? = null,
    val phone: String? = null,
    val currentPassword: String? = null,
    val newPassword: String? = null
)

data class Service(
    val id: Int,
    val name: String,
    val description: String?,
    val category: String,
    val base_price: Double,
    val unit: String?
)

data class QuotationRequest(
    val service_id: Int,
    val quantity: Int = 1,
    val notes: String? = null
)

data class Quotation(
    val id: Int,
    val user_id: Int,
    val service_id: Int,
    val quantity: Int,
    val estimated_price: Double?,
    val status: String,
    val service_name: String? = null,
    val created_at: String?
)

data class OrderItemRequest(val service_id: Int, val quantity: Int = 1)
data class CreateOrderRequest(val items: List<OrderItemRequest>, val notes: String? = null)

data class Order(
    val id: Int,
    val user_id: Int,
    val status: String,
    val total_amount: Double,
    val notes: String?,
    val created_at: String?,
    val customer_name: String? = null
)

data class OrderDetail(
    val id: Int,
    val status: String,
    val total_amount: Double,
    val notes: String?,
    val items: List<OrderItem>?,
    val files: List<FileRecord>?,
    val payment: Payment?
)

data class OrderItem(
    val id: Int,
    val service_id: Int,
    val quantity: Int,
    val unit_price: Double,
    val line_total: Double,
    val service_name: String?
)

data class FileRecord(
    val id: Int,
    val original_name: String,
    val size_bytes: Long?
)

data class Payment(
    val id: Int,
    val amount: Double,
    val method: String,
    val status: String,
    val transaction_id: String?
)

data class ApiError(val error: String)
