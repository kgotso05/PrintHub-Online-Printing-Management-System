package com.printhub.ui

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.printhub.data.api.ApiClient
import com.printhub.ui.auth.LoginScreen
import com.printhub.ui.auth.RegisterScreen
import com.printhub.ui.home.HomeScreen
import com.printhub.ui.orders.OrdersScreen
import com.printhub.ui.services.ServicesScreen
import com.printhub.ui.settings.SettingsScreen
import com.printhub.ui.theme.AppThemeMode

object Routes {
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val HOME = "home"
    const val SERVICES = "services"
    const val ORDERS = "orders"
    const val SETTINGS = "settings"
}

@Composable
fun PrintHubNavGraph(
    onThemeChanged: (AppThemeMode) -> Unit
) {
    val nav = rememberNavController()

    val start = if (ApiClient.tokens().getToken() != null) {
        Routes.HOME
    } else {
        Routes.LOGIN
    }

    NavHost(
        navController = nav,
        startDestination = start
    ) {
        composable(Routes.LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    nav.navigate(Routes.HOME) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
                onRegisterClick = {
                    nav.navigate(Routes.REGISTER)
                }
            )
        }

        composable(Routes.REGISTER) {
            RegisterScreen(
                onRegisterSuccess = {
                    nav.navigate(Routes.HOME) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
                onLoginClick = {
                    nav.popBackStack()
                }
            )
        }

        composable(Routes.HOME) {
            HomeScreen(
                onServices = { nav.navigate(Routes.SERVICES) },
                onOrders = { nav.navigate(Routes.ORDERS) },
                onSettings = { nav.navigate(Routes.SETTINGS) },
                onLogout = {
                    ApiClient.tokens().clear()
                    nav.navigate(Routes.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.SERVICES) {
            ServicesScreen(
                onBack = { nav.popBackStack() }
            )
        }

        composable(Routes.ORDERS) {
            OrdersScreen(
                onBack = { nav.popBackStack() }
            )
        }

        composable(Routes.SETTINGS) {
            SettingsScreen(
                onBack = { nav.popBackStack() },
                onLogout = {
                    ApiClient.tokens().clear()
                    nav.navigate(Routes.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onThemeChanged = onThemeChanged
            )
        }
    }
}