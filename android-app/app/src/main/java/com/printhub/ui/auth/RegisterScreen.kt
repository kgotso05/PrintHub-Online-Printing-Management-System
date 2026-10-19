package com.printhub.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.google.gson.Gson
import com.printhub.data.api.ApiClient
import com.printhub.data.model.RegisterRequest
import kotlinx.coroutines.launch

@Composable
fun RegisterScreen(onRegisterSuccess: () -> Unit, onLoginClick: () -> Unit) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Create Account", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(20.dp))
        if (error != null) Text(error!!, color = MaterialTheme.colorScheme.error)

        OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Full name") },
            singleLine = true, modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp))
        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") },
            singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp))
        OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("Phone (optional)") },
            singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp))
        OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Password") },
            singleLine = true, visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp))

        Button(
            onClick = {
                if (name.isBlank() || email.isBlank() || password.length < 6) {
                    error = "Name, email and password (min 6 chars) required"
                    return@Button
                }
                loading = true
                error = null
                scope.launch {
                    try {
                        val res = ApiClient.api().register(
                            RegisterRequest(name.trim(), email.trim(), password, phone.ifBlank { null })
                        )
                        ApiClient.tokens().saveToken(res.token)
                        ApiClient.tokens().saveUserJson(Gson().toJson(res.user))
                        onRegisterSuccess()
                    } catch (e: Exception) {
                        error = e.message ?: "Registration failed"
                    } finally {
                        loading = false
                    }
                }
            },
            enabled = !loading,
            modifier = Modifier.fillMaxWidth().height(48.dp)
        ) { Text(if (loading) "Creating…" else "Register") }

        TextButton(onClick = onLoginClick) { Text("Already have an account? Sign in") }
    }
}
