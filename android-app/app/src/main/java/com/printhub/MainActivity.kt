package com.printhub

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.printhub.ui.PrintHubNavGraph
import com.printhub.ui.theme.AppThemeMode
import com.printhub.ui.theme.PrintHubTheme

class MainActivity : ComponentActivity() {

    private var themeMode by mutableStateOf(AppThemeMode.SYSTEM)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        themeMode = PrintHubApp.getThemeMode(this)

        setContent {
            PrintHubTheme(themeMode = themeMode) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    PrintHubNavGraph(
                        onThemeChanged = { newMode ->
                            PrintHubApp.saveThemeMode(this, newMode)
                            themeMode = newMode
                        }
                    )
                }
            }
        }
    }
}