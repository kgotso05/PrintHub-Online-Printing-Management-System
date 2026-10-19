package com.printhub.data.api

import com.printhub.data.model.*
import retrofit2.http.*

interface PrintHubApi {

    @POST("auth/register")
    suspend fun register(@Body body: RegisterRequest): AuthResponse

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): AuthResponse

    @POST("auth/sso")
    suspend fun sso(@Body body: SsoRequest): AuthResponse

    @GET("auth/me")
    suspend fun me(): User

    @PUT("auth/settings")
    suspend fun updateSettings(@Body body: SettingsRequest): Map<String, Any>

    @GET("services")
    suspend fun getServices(@Query("category") category: String? = null): List<Service>

    @GET("services/{id}")
    suspend fun getService(@Path("id") id: Int): Service

    @POST("quotations")
    suspend fun createQuotation(@Body body: QuotationRequest): Quotation

    @GET("quotations")
    suspend fun getQuotations(): List<Quotation>

    @POST("orders")
    suspend fun createOrder(@Body body: CreateOrderRequest): Order

    @GET("orders")
    suspend fun getOrders(): List<Order>

    @GET("orders/{id}")
    suspend fun getOrder(@Path("id") id: Int): OrderDetail

    @PATCH("orders/{id}/status")
    suspend fun updateOrderStatus(@Path("id") id: Int, @Body body: Map<String, String>): Order
}
