-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: printhub
-- ------------------------------------------------------
-- Server version	8.4.13

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Black and White Printing','Standard monochrome printing','2026-10-20 06:40:45'),(2,'Colour Printing','Full-colour document printing','2026-10-20 06:40:45'),(3,'Photocopying','Document copying services','2026-10-20 06:40:45'),(4,'Binding','Document and booklet binding','2026-10-20 06:40:45'),(5,'Laminating','Protective document lamination','2026-10-20 06:40:45'),(6,'Scanning','Document scanning to digital formats','2026-10-20 06:40:45'),(7,'Poster Printing','Large-format poster printing','2026-10-20 06:40:45'),(8,'Business Cards','Custom business card printing','2026-10-20 06:40:45'),(9,'Flyers and Brochures','Marketing material printing','2026-10-20 06:40:45'),(10,'Photo Printing','High-quality photograph printing','2026-10-20 06:40:45');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Thabo Mokoena','thabo.mokoena@example.com','TEST_ACCOUNT_NO_PASSWORD','0710000001','2026-10-20 06:45:53'),(2,'Lerato Nkosi','lerato.nkosi@example.com','TEST_ACCOUNT_NO_PASSWORD','0710000002','2026-10-20 06:45:53'),(3,'Sipho Dlamini','sipho.dlamini@example.com','TEST_ACCOUNT_NO_PASSWORD','0710000003','2026-10-20 06:45:53'),(4,'Nomsa Khumalo','nomsa.khumalo@example.com','TEST_ACCOUNT_NO_PASSWORD','0710000004','2026-10-20 06:45:53'),(5,'Kabelo Molefe','kabelo.molefe@example.com','TEST_ACCOUNT_NO_PASSWORD','0710000005','2026-10-20 06:45:53'),(6,'Palesa Maseko','palesa.maseko@example.com','TEST_ACCOUNT_NO_PASSWORD','0710000006','2026-10-20 06:45:53'),(7,'Tshepo Ndlovu','tshepo.ndlovu@example.com','TEST_ACCOUNT_NO_PASSWORD','0710000007','2026-10-20 06:45:53'),(8,'Boitumelo Radebe','boitumelo.radebe@example.com','TEST_ACCOUNT_NO_PASSWORD','0710000008','2026-10-20 06:45:53'),(9,'Karabo Sithole','karabo.sithole@example.com','TEST_ACCOUNT_NO_PASSWORD','0710000009','2026-10-20 06:45:53'),(10,'Naledi Mthembu','naledi.mthembu@example.com','TEST_ACCOUNT_NO_PASSWORD','0710000010','2026-10-20 06:45:53');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `service_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS ((`quantity` * `unit_price`)) STORED,
  PRIMARY KEY (`order_item_id`),
  KEY `fk_item_order` (`order_id`),
  KEY `fk_item_service` (`service_id`),
  CONSTRAINT `fk_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `fk_item_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`),
  CONSTRAINT `chk_item_price` CHECK ((`unit_price` >= 0)),
  CONSTRAINT `chk_item_quantity` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` (`order_item_id`, `order_id`, `service_id`, `quantity`, `unit_price`) VALUES (1,10,1,40,2.00),(2,1,2,20,5.00),(3,3,3,30,1.50),(4,2,4,1,25.00),(5,4,5,5,15.00),(6,7,6,15,3.00),(7,6,7,2,80.00),(8,8,8,1,120.00),(9,9,9,50,4.00),(10,5,10,10,10.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `order_status` enum('Pending','Confirmed','Processing','Ready','Completed','Cancelled') DEFAULT 'Pending',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `special_instructions` text,
  PRIMARY KEY (`order_id`),
  KEY `fk_order_customer` (`customer_id`),
  CONSTRAINT `fk_order_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,'2026-10-20 06:46:52','Pending',100.00,'Print 20 A4 colour pages'),(2,2,'2026-10-20 06:46:52','Confirmed',25.00,'Print and bind assignment'),(3,3,'2026-10-20 06:46:52','Processing',45.00,'Photocopy 30 pages'),(4,4,'2026-10-20 06:46:52','Ready',75.00,'Laminate five certificates'),(5,5,'2026-10-20 06:46:52','Completed',100.00,'Print 10 photographs'),(6,6,'2026-10-20 06:46:52','Pending',160.00,'Print two A2 posters'),(7,7,'2026-10-20 06:46:52','Confirmed',45.00,'Scan 15 documents'),(8,8,'2026-10-20 06:46:52','Processing',120.00,'Print 100 business cards'),(9,9,'2026-10-20 06:46:52','Ready',200.00,'Print 50 promotional flyers'),(10,10,'2026-10-20 06:46:52','Completed',80.00,'Print 40 black and white pages');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('Cash','Card','EFT') NOT NULL,
  `payment_status` enum('Pending','Successful','Failed','Refunded') DEFAULT 'Pending',
  `transaction_reference` varchar(150) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `fk_payment_order` (`order_id`),
  CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `chk_payment_amount` CHECK ((`amount` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,100.00,'EFT','Pending','TEST-PAY-001','2026-10-20 06:50:31'),(2,2,25.00,'Cash','Successful','TEST-PAY-002','2026-10-20 06:50:31'),(3,3,45.00,'Card','Successful','TEST-PAY-003','2026-10-20 06:50:31'),(4,4,75.00,'EFT','Successful','TEST-PAY-004','2026-10-20 06:50:31'),(5,5,100.00,'Cash','Successful','TEST-PAY-005','2026-10-20 06:50:31'),(6,6,160.00,'EFT','Pending','TEST-PAY-006','2026-10-20 06:50:31'),(7,7,45.00,'Card','Pending','TEST-PAY-007','2026-10-20 06:50:31'),(8,8,120.00,'EFT','Successful','TEST-PAY-008','2026-10-20 06:50:31'),(9,9,200.00,'Cash','Successful','TEST-PAY-009','2026-10-20 06:50:31'),(10,10,80.00,'Card','Successful','TEST-PAY-010','2026-10-20 06:50:31');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `service_name` varchar(150) NOT NULL,
  `description` text,
  `base_price` decimal(10,2) NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_id`),
  KEY `fk_service_category` (`category_id`),
  CONSTRAINT `fk_service_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,1,'A4 Black and White Printing','Standard A4 monochrome printing',2.00,1,'2026-10-20 06:43:57'),(2,2,'A4 Colour Printing','Full-colour A4 printing',5.00,1,'2026-10-20 06:43:57'),(3,3,'A4 Photocopying','Standard A4 document copying',1.50,1,'2026-10-20 06:43:57'),(4,4,'Spiral Binding','Spiral binding for documents',25.00,1,'2026-10-20 06:43:57'),(5,5,'A4 Lamination','Protective A4 document lamination',15.00,1,'2026-10-20 06:43:57'),(6,6,'Document Scanning','Scan documents to PDF',3.00,1,'2026-10-20 06:43:57'),(7,7,'A2 Poster Printing','Full-colour A2 poster printing',80.00,1,'2026-10-20 06:43:57'),(8,8,'Business Card Printing','Custom business cards',120.00,1,'2026-10-20 06:43:57'),(9,9,'A5 Flyer Printing','Promotional A5 flyers',4.00,1,'2026-10-20 06:43:57'),(10,10,'10x15 Photo Printing','Glossy photograph printing',10.00,1,'2026-10-20 06:43:57');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uploads`
--

DROP TABLE IF EXISTS `uploads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uploads` (
  `upload_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`upload_id`),
  KEY `fk_upload_order` (`order_id`),
  CONSTRAINT `fk_upload_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `chk_upload_file_size` CHECK ((`file_size` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uploads`
--

LOCK TABLES `uploads` WRITE;
/*!40000 ALTER TABLE `uploads` DISABLE KEYS */;
INSERT INTO `uploads` VALUES (1,1,'assignment.pdf','test-uploads/assignment.pdf','application/pdf',204800,'2026-10-20 06:51:24'),(2,2,'research.pdf','test-uploads/research.pdf','application/pdf',307200,'2026-10-20 06:51:24'),(3,3,'notes.pdf','test-uploads/notes.pdf','application/pdf',153600,'2026-10-20 06:51:24'),(4,4,'certificate.pdf','test-uploads/certificate.pdf','application/pdf',102400,'2026-10-20 06:51:24'),(5,5,'photos.jpg','test-uploads/photos.jpg','image/jpeg',512000,'2026-10-20 06:51:24'),(6,6,'poster.png','test-uploads/poster.png','image/png',716800,'2026-10-20 06:51:24'),(7,7,'documents.pdf','test-uploads/documents.pdf','application/pdf',409600,'2026-10-20 06:51:24'),(8,8,'business_card.pdf','test-uploads/business_card.pdf','application/pdf',204800,'2026-10-20 06:51:24'),(9,9,'flyer.pdf','test-uploads/flyer.pdf','application/pdf',307200,'2026-10-20 06:51:24'),(10,10,'study_notes.pdf','test-uploads/study_notes.pdf','application/pdf',256000,'2026-10-20 06:51:24');
/*!40000 ALTER TABLE `uploads` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-20  9:15:49
