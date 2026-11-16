# PrintHub – Online Printing Management System

## 1. Project Overview

PrintHub is an online printing management system consisting of a website, Android mobile application, REST API and MySQL database.

The system allows customers to browse available printing services, register and log in, place printing orders, upload supporting documents and monitor their orders. Administrative functionality supports the management of services, customers and orders.

## 2. Technologies Used

| Component | Technology |
|---|---|
| Website | HTML, CSS, JavaScript |
| Android application | Kotlin, XML |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | bcrypt and JSON Web Tokens (JWT) |
| API testing | Postman |
| Development tools | Visual Studio Code, Android Studio, MySQL Workbench |

## 3. Main System Features

### Website
- Customer registration and login.
- Browse available printing services.
- Customer dashboard.
- Place printing orders.
- View customer orders and order details.
- Administrative pages for managing services, customers and orders.

### Android Application
- Customer registration and login.
- Dashboard.
- Browse printing services.
- Place orders.
- View previous orders and order statuses.

### REST API
- Customer registration and authentication.
- Password hashing.
- JWT-based authentication.
- Retrieve available services.
- Create and retrieve customer orders.
- Retrieve order statuses.
- Upload and retrieve order documents.

## 4. Database

The system uses MySQL and contains seven main tables:

1. categories
2. customers
3. services
4. orders
5. order_items
6. payments
7. uploads

Database files are available in the `database` folder.

## 5. Project Evidence

Supporting screenshots and test results are organised into:

- `API_Evidence/` – API implementation and Postman testing.
- `Mobile_Evidence/` – Android application screenshots.
- `Website_Evidence/` – Website screenshots.
- `database/` – Database export and supporting database files.

## 6. Video Demonstration

**PrintHub System Demonstration:**

[Watch the PrintHub Demonstration Video](https://drive.google.com/file/d/1hHuOFzbN1AAfsgh5qTD6pjsdhH_MyZOh/view?usp=drivesdk)

## 7. Running the Backend

1. Install Node.js and MySQL.
2. Navigate to the `backend` directory.
3. Install dependencies using `npm install`.
4. Configure your local environment variables in a `.env` file.
5. Start the backend using:

```bash
npm run dev
```

The API runs on port 5000 by default.

Do not upload your `.env` file or expose database credentials.

## 8. Project Limitations and Future Improvements

- Implement Single Sign-On (SSO).
- Publish the Android application through Google Play Console.
- Further improve administrative functionality.
- Expand testing and system functionality.

## 9. Academic Submission

This repository contains the PrintHub project source code, database files, screenshots and supporting testing evidence for the project submission.
