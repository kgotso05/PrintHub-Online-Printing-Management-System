package com.printhub.ui.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.printhub.PrintHubApp
import com.printhub.data.api.ApiClient
import com.printhub.data.model.SettingsRequest
import com.printhub.ui.theme.AppThemeMode
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    onLogout: () -> Unit,
    onThemeChanged: (AppThemeMode) -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }

    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }
    var showLogoutConfirmation by remember { mutableStateOf(false) }

    var themeMode by remember {
        mutableStateOf(PrintHubApp.getThemeMode(context))
    }

    var notificationsEnabled by remember {
        mutableStateOf(
            PrintHubApp.getNotificationPreference(
                context,
                PrintHubApp.NOTIFICATIONS_KEY
            )
        )
    }

    var orderNotifications by remember {
        mutableStateOf(
            PrintHubApp.getNotificationPreference(
                context,
                PrintHubApp.ORDER_NOTIFICATIONS_KEY
            )
        )
    }

    var quotationNotifications by remember {
        mutableStateOf(
            PrintHubApp.getNotificationPreference(
                context,
                PrintHubApp.QUOTATION_NOTIFICATIONS_KEY
            )
        )
    }

    var promotionalNotifications by remember {
        mutableStateOf(
            PrintHubApp.getNotificationPreference(
                context,
                PrintHubApp.PROMOTIONAL_NOTIFICATIONS_KEY
            )
        )
    }

    LaunchedEffect(Unit) {
        try {
            val user = ApiClient.api().me()
            name = user.name
            phone = user.phone ?: ""
        } catch (e: Exception) {
            error = "Unable to load your profile. You can still change local preferences."
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    TextButton(onClick = onBack) {
                        Text("Back")
                    }
                }
            )
        }
    ) { padding ->

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {

            Text(
                "Account",
                style = MaterialTheme.typography.titleLarge
            )

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Full name") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it },
                label = { Text("Phone") },
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Phone
                ),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Text(
                "Change Password",
                style = MaterialTheme.typography.titleMedium
            )

            OutlinedTextField(
                value = currentPassword,
                onValueChange = { currentPassword = it },
                label = { Text("Current password") },
                visualTransformation = PasswordVisualTransformation(),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = newPassword,
                onValueChange = { newPassword = it },
                label = { Text("New password") },
                visualTransformation = PasswordVisualTransformation(),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

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

                            message = "Settings updated successfully."
                            currentPassword = ""
                            newPassword = ""
                        } catch (e: Exception) {
                            error = e.message ?: "Unable to update settings."
                        } finally {
                            loading = false
                        }
                    }
                },
                enabled = !loading,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (loading) "Saving..." else "Save Changes")
            }

            HorizontalDivider()

            // Appearance
            Text(
                "Appearance",
                style = MaterialTheme.typography.titleLarge
            )

            Text(
                "Choose how PrintHub looks on your device.",
                style = MaterialTheme.typography.bodyMedium
            )

            ThemeOption(
                title = "System default",
                description = "Follow your device theme",
                selected = themeMode == AppThemeMode.SYSTEM
            ) {
                themeMode = AppThemeMode.SYSTEM
                PrintHubApp.saveThemeMode(context, themeMode)
                onThemeChanged(themeMode)
            }

            ThemeOption(
                title = "Light mode",
                description = "Use a light appearance",
                selected = themeMode == AppThemeMode.LIGHT
            ) {
                themeMode = AppThemeMode.LIGHT
                PrintHubApp.saveThemeMode(context, themeMode)
                onThemeChanged(themeMode)
            }

            ThemeOption(
                title = "Dark mode",
                description = "Use a dark appearance",
                selected = themeMode == AppThemeMode.DARK
            ) {
                themeMode = AppThemeMode.DARK
                PrintHubApp.saveThemeMode(context, themeMode)
                onThemeChanged(themeMode)
            }

            HorizontalDivider()

            // Notifications
            Text(
                "Notifications",
                style = MaterialTheme.typography.titleLarge
            )

            PreferenceSwitch(
                title = "Enable notifications",
                description = "Master notification preference",
                checked = notificationsEnabled,
                onCheckedChange = {
                    notificationsEnabled = it
                    PrintHubApp.saveNotificationPreference(
                        context,
                        PrintHubApp.NOTIFICATIONS_KEY,
                        it
                    )
                }
            )

            PreferenceSwitch(
                title = "Order updates",
                description = "Receive updates about your printing orders",
                checked = orderNotifications,
                enabled = notificationsEnabled,
                onCheckedChange = {
                    orderNotifications = it
                    PrintHubApp.saveNotificationPreference(
                        context,
                        PrintHubApp.ORDER_NOTIFICATIONS_KEY,
                        it
                    )
                }
            )

            PreferenceSwitch(
                title = "Quotation updates",
                description = "Receive updates about your quotations",
                checked = quotationNotifications,
                enabled = notificationsEnabled,
                onCheckedChange = {
                    quotationNotifications = it
                    PrintHubApp.saveNotificationPreference(
                        context,
                        PrintHubApp.QUOTATION_NOTIFICATIONS_KEY,
                        it
                    )
                }
            )

            PreferenceSwitch(
                title = "Promotional notifications",
                description = "Receive news and special offers",
                checked = promotionalNotifications,
                enabled = notificationsEnabled,
                onCheckedChange = {
                    promotionalNotifications = it
                    PrintHubApp.saveNotificationPreference(
                        context,
                        PrintHubApp.PROMOTIONAL_NOTIFICATIONS_KEY,
                        it
                    )
                }
            )

            HorizontalDivider()

            // About
            Text(
                "About PrintHub",
                style = MaterialTheme.typography.titleLarge
            )

            Text(
                "PrintHub is an online printing management system " +
                        "that helps customers explore printing services, " +
                        "request quotations, place orders and track progress.",
                style = MaterialTheme.typography.bodyMedium
            )

            Text(
                "Version 1.0.0",
                style = MaterialTheme.typography.bodySmall
            )

            Text(
                "XISD6329 – Work Integrated Learning 3B",
                style = MaterialTheme.typography.bodySmall
            )

            HorizontalDivider()

            // Feedback
            message?.let {
                Text(
                    text = it,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            error?.let {
                Text(
                    text = it,
                    color = MaterialTheme.colorScheme.error
                )
            }

            OutlinedButton(
                onClick = { showLogoutConfirmation = true },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Sign Out")
            }

            Spacer(Modifier.height(12.dp))
        }
    }

    if (showLogoutConfirmation) {
        AlertDialog(
            onDismissRequest = {
                showLogoutConfirmation = false
            },
            title = {
                Text("Sign out?")
            },
            text = {
                Text("Are you sure you want to sign out of PrintHub?")
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showLogoutConfirmation = false
                        onLogout()
                    }
                ) {
                    Text("Sign Out")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showLogoutConfirmation = false
                    }
                ) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun ThemeOption(
    title: String,
    description: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(
            selected = selected,
            onClick = onClick
        )

        Column(
            modifier = Modifier
                .weight(1f)
                .padding(start = 8.dp)
        ) {
            Text(title, style = MaterialTheme.typography.bodyLarge)
            Text(
                description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun PreferenceSwitch(
    title: String,
    description: String,
    checked: Boolean,
    enabled: Boolean = true,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            modifier = Modifier
                .weight(1f)
                .padding(end = 12.dp)
        ) {
            Text(title, style = MaterialTheme.typography.bodyLarge)
            Text(
                description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            enabled = enabled
        )
    }
}