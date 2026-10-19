package com.printhub

import android.app.Application
import com.printhub.data.api.ApiClient

class PrintHubApp : Application() {
    override fun onCreate() {
        super.onCreate()
        ApiClient.init(this)
    }
}
