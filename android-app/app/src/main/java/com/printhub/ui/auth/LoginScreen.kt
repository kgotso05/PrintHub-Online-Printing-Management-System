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
import com.printhub.data.model.LoginRequest
import com.printhub.data.model.SsoRequest
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(onLoginSuccess: () -> Unit, onRegisterClick: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("PrintHub", style = MaterialTheme.typography.headlineLarge, color = MaterialTheme.colorScheme.primary)
        Text("Sign in to your account", style = MaterialTheme.typography.bodyLarge, modifier = Modifier.padding(bottom = 24.dp))

        if (error != null) {
            Text(error!!, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(bottom = 12.dp))
        }

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
        )
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            modifier = Modifier.fillMaxWidth().padding(bottom = 20.dp)
        )

        Button(
            onClick = {
                if (email.isBlank() || password.isBlank()) {
                    error = "Please enter email and password"
                    return@Button
                }
                loading = true
                error = null
                scope.launch {
                    try {
                        val res = ApiClient.api().login(LoginRequest(email.trim(), password))
                        ApiClient.tokens().saveToken(res.token)
                        ApiClient.tokens().saveUserJson(Gson().toJson(res.user))
                        onLoginSuccess()
                    } catch (e: Exception) {
                        error = e.message ?: "Login failed"
                    } finally {
                        loading = false
                    }
                }
            },
            enabled = !loading,
            modifier = Modifier.fillMaxWidth().height(48.dp)
        ) {
            Text(if (loading) "Signing in…" else "Sign In")
        }

        Spacer(Modifier.height(12.dp))
        OutlinedButton(
            onClick = {
                // Demo SSO
                loading = true
                error = null
                scope.launch {
                    try {
                        val res = ApiClient.api().sso(
                            SsoRequest(email = "sso.user@gmail.com", name = "SSO Demo User", providerId = "demo")
                        )
                        ApiClient.tokens().saveToken(res.token)
                        ApiClient.tokens().saveUserJson(Gson().toJson(res.user))
                        onLoginSuccess()
                    } catch (e: Exception) {
                        error = e.message ?: "SSO failed"
                    } finally {
                        loading = false
                    }
                }
            },
            enabled = !loading,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Continue with Google (SSO Demo)")
        }

        TextButton(onClick = onRegisterClick, modifier = Modifier.padding(top = 16.dp)) {
            Text("Don't have an account? Register")
        }
    }
}
