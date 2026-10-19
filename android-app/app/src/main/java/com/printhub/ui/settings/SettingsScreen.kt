package com.printhub.ui.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.printhub.data.api.ApiClient
import com.printhub.data.model.SettingsRequest
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(onBack: () -> Unit, onLogout: () -> Unit) {
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            try {
                val user = ApiClient.api().me()
                name = user.name
                phone = user.phone ?: ""
            } catch (_: Exception) {}
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = { TextButton(onClick = onBack) { Text("Back") } }
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(24.dp)) {
            if (message != null) Text(message!!, color = MaterialTheme.colorScheme.primary)
            if (error != null) Text(error!!, color = MaterialTheme.colorScheme.error)

            OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Full name") },
                singleLine = true, modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp))
            OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("Phone") },
                singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp))

            Text("Change Password", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(value = currentPassword, onValueChange = { currentPassword = it },
                label = { Text("Current password") }, singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp))
            OutlinedTextField(value = newPassword, onValueChange = { newPassword = it },
                label = { Text("New password") }, singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp))

            Button(
                onClick = {
                    loading = true
                    message = null
                    error = null
                    scope.launch {
                        try {
                            val body = SettingsRequest(
                                name = name.trim().ifBlank { null },
                                phone = phone.trim().ifBlank { null },
                                currentPassword = currentPassword.ifBlank { null },
                                newPassword = newPassword.ifBlank { null }
                            )
                            ApiClient.api().updateSettings(body)
                            message = "Settings updated"
                            currentPassword = ""
                            newPassword = ""
                        } catch (e: Exception) {
                            error = e.message ?: "Update failed"
                        } finally {
                            loading = false
                        }
                    }
                },
                enabled = !loading,
                modifier = Modifier.fillMaxWidth()
            ) { Text(if (loading) "Saving…" else "Save Changes") }

            Spacer(Modifier.height(24.dp))
            OutlinedButton(onClick = onLogout, modifier = Modifier.fillMaxWidth()) {
                Text("Logout")
            }
        }
    }
}
