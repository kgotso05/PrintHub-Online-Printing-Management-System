package com.printhub.data.api

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.printhub.BuildConfig
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {

    private var api: PrintHubApi? = null
    private var tokenStore: TokenStore? = null

    fun init(context: Context) {
        tokenStore = TokenStore(context.applicationContext)
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        val authInterceptor = Interceptor { chain ->
            val req = chain.request().newBuilder()
            tokenStore?.getToken()?.let { req.addHeader("Authorization", "Bearer $it") }
            chain.proceed(req.build())
        }
        val client = OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()

        api = Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(PrintHubApi::class.java)
    }

    fun api(): PrintHubApi = api ?: throw IllegalStateException("ApiClient not initialised")
    fun tokens(): TokenStore = tokenStore ?: throw IllegalStateException("ApiClient not initialised")
}

class TokenStore(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        "printhub_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveToken(token: String) = prefs.edit().putString("token", token).apply()
    fun getToken(): String? = prefs.getString("token", null)
    fun clear() = prefs.edit().clear().apply()

    fun saveUserJson(json: String) = prefs.edit().putString("user", json).apply()
    fun getUserJson(): String? = prefs.getString("user", null)
}
