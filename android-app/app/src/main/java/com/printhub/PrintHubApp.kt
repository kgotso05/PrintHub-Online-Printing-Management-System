package com.printhub

import android.app.Application
import android.content.Context
import com.printhub.data.api.ApiClient
import com.printhub.ui.theme.AppThemeMode

class PrintHubApp : Application() {

    override fun onCreate() {
        super.onCreate()
        ApiClient.init(this)
    }

    companion object {
        private const val PREFS_NAME = "printhub_preferences"

        private const val KEY_THEME = "theme_mode"
        private const val KEY_NOTIFICATIONS = "notifications_enabled"
        private const val KEY_ORDER_NOTIFICATIONS = "order_notifications"
        private const val KEY_QUOTATION_NOTIFICATIONS = "quotation_notifications"
        private const val KEY_PROMOTIONAL_NOTIFICATIONS = "promotional_notifications"

        fun getThemeMode(context: Context): AppThemeMode {
            val preferences = context.getSharedPreferences(
                PREFS_NAME,
                Context.MODE_PRIVATE
            )

            val savedMode = preferences.getString(KEY_THEME, "SYSTEM")

            return runCatching {
                AppThemeMode.valueOf(savedMode ?: "SYSTEM")
            }.getOrDefault(AppThemeMode.SYSTEM)
        }

        fun saveThemeMode(context: Context, mode: AppThemeMode) {
            context.getSharedPreferences(
                PREFS_NAME,
                Context.MODE_PRIVATE
            ).edit()
                .putString(KEY_THEME, mode.name)
                .apply()
        }

        fun getNotificationPreference(
            context: Context,
            key: String,
            defaultValue: Boolean = true
        ): Boolean {
            return context.getSharedPreferences(
                PREFS_NAME,
                Context.MODE_PRIVATE
            ).getBoolean(key, defaultValue)
        }

        fun saveNotificationPreference(
            context: Context,
            key: String,
            enabled: Boolean
        ) {
            context.getSharedPreferences(
                PREFS_NAME,
                Context.MODE_PRIVATE
            ).edit()
                .putBoolean(key, enabled)
                .apply()
        }

        const val NOTIFICATIONS_KEY = KEY_NOTIFICATIONS
        const val ORDER_NOTIFICATIONS_KEY = KEY_ORDER_NOTIFICATIONS
        const val QUOTATION_NOTIFICATIONS_KEY = KEY_QUOTATION_NOTIFICATIONS
        const val PROMOTIONAL_NOTIFICATIONS_KEY = KEY_PROMOTIONAL_NOTIFICATIONS
    }
}