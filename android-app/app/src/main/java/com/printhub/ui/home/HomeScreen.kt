package com.printhub.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onServices: () -> Unit,
    onOrders: () -> Unit,
    onSettings: () -> Unit,
    onLogout: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("PrintHub") },
                actions = {
                    TextButton(onClick = onSettings) { Text("Settings") }
                    TextButton(onClick = onLogout) { Text("Logout") }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text("Welcome to PrintHub", style = MaterialTheme.typography.headlineMedium)
            Text("Manage your printing orders on the go", style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(vertical = 12.dp))
            Spacer(Modifier.height(24.dp))
            Button(onClick = onServices, modifier = Modifier.fillMaxWidth().height(52.dp)) {
                Text("Browse Services")
            }
            Spacer(Modifier.height(12.dp))
            OutlinedButton(onClick = onOrders, modifier = Modifier.fillMaxWidth().height(52.dp)) {
                Text("My Orders")
            }
            Spacer(Modifier.height(12.dp))
            OutlinedButton(onClick = onSettings, modifier = Modifier.fillMaxWidth().height(52.dp)) {
                Text("Account Settings")
            }
        }
    }
}
