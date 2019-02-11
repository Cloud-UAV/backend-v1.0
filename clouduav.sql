-- MySQL dump 10.13  Distrib 5.7.19, for osx10.12 (x86_64)
--
-- Host: localhost    Database: clouduav
-- ------------------------------------------------------
-- Server version	5.7.19

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `DroneFiles`
--

DROP TABLE IF EXISTS `DroneFiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DroneFiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `uploadDate` varchar(255) NOT NULL,
  `droneID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `droneID` (`droneID`),
  CONSTRAINT `dronefiles_ibfk_2` FOREIGN KEY (`droneID`) REFERENCES `Drones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1281 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DroneInventory`
--

DROP TABLE IF EXISTS `DroneInventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DroneInventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  `droneID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `droneID` (`droneID`),
  CONSTRAINT `droneinventory_ibfk_1` FOREIGN KEY (`droneID`) REFERENCES `Drones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Drones`
--

DROP TABLE IF EXISTS `Drones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Drones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `userID` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `thingID` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_Drones` (`name`,`userID`,`thingID`),
  KEY `userID` (`userID`),
  CONSTRAINT `drones_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `Users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MissionFiles`
--

DROP TABLE IF EXISTS `MissionFiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MissionFiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `missionID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  `uploadDate` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `missionID` (`missionID`),
  CONSTRAINT `missionfiles_ibfk_1` FOREIGN KEY (`missionID`) REFERENCES `Missions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MissionPersonnels`
--

DROP TABLE IF EXISTS `MissionPersonnels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MissionPersonnels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `missionID` int(11) NOT NULL,
  `personnelID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `missionID` (`missionID`),
  KEY `personnelID` (`personnelID`),
  CONSTRAINT `missionpersonnels_ibfk_2` FOREIGN KEY (`missionID`) REFERENCES `Missions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `missionpersonnels_ibfk_3` FOREIGN KEY (`personnelID`) REFERENCES `Personnel` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Missions`
--

DROP TABLE IF EXISTS `Missions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Missions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectID` int(11) NOT NULL,
  `startTime` varchar(255) DEFAULT NULL,
  `endTime` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `droneID` int(11) DEFAULT NULL,
  `sensorID` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `location` point DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `projectID` (`projectID`),
  KEY `droneID` (`droneID`),
  KEY `sensorID` (`sensorID`),
  CONSTRAINT `missions_ibfk_1` FOREIGN KEY (`projectID`) REFERENCES `Projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `missions_ibfk_2` FOREIGN KEY (`droneID`) REFERENCES `Drones` (`id`),
  CONSTRAINT `missions_ibfk_3` FOREIGN KEY (`sensorID`) REFERENCES `Sensors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Personnel`
--

DROP TABLE IF EXISTS `Personnel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Personnel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `imagePath` varchar(255) DEFAULT NULL,
  `userID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `userID` (`userID`),
  CONSTRAINT `personnel_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `Users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PersonnelFiles`
--

DROP TABLE IF EXISTS `PersonnelFiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PersonnelFiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `personnelID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `uploadDate` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UC_PersonnelFiles` (`personnelID`,`name`),
  CONSTRAINT `personnelfiles_ibfk_1` FOREIGN KEY (`personnelID`) REFERENCES `Personnel` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ProjectComplianceFiles`
--

DROP TABLE IF EXISTS `ProjectComplianceFiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ProjectComplianceFiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  `uploadDate` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_keys` (`projectID`,`name`),
  CONSTRAINT `projectcompliancefiles_ibfk_1` FOREIGN KEY (`projectID`) REFERENCES `Projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ProjectDrones`
--

DROP TABLE IF EXISTS `ProjectDrones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ProjectDrones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectID` int(11) NOT NULL,
  `droneID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UC_ProjectsPersonnel` (`projectID`,`droneID`),
  KEY `droneID` (`droneID`),
  CONSTRAINT `projectdrones_ibfk_1` FOREIGN KEY (`projectID`) REFERENCES `Projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `projectdrones_ibfk_2` FOREIGN KEY (`droneID`) REFERENCES `Drones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ProjectPersonnelRoles`
--

DROP TABLE IF EXISTS `ProjectPersonnelRoles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ProjectPersonnelRoles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `roleID` int(11) NOT NULL,
  `projectID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_keys` (`roleID`,`projectID`),
  KEY `projectID` (`projectID`),
  CONSTRAINT `projectpersonnelroles_ibfk_1` FOREIGN KEY (`projectID`) REFERENCES `Projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `projectpersonnelroles_ibfk_2` FOREIGN KEY (`roleID`) REFERENCES `Roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ProjectPersonnels`
--

DROP TABLE IF EXISTS `ProjectPersonnels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ProjectPersonnels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectID` int(11) NOT NULL,
  `personnelID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UC_ProjectsPersonnel` (`projectID`,`personnelID`),
  KEY `personnelID` (`personnelID`),
  CONSTRAINT `projectpersonnels_ibfk_1` FOREIGN KEY (`projectID`) REFERENCES `Projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `projectpersonnels_ibfk_2` FOREIGN KEY (`personnelID`) REFERENCES `Personnel` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ProjectSensors`
--

DROP TABLE IF EXISTS `ProjectSensors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ProjectSensors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectID` int(11) NOT NULL,
  `sensorID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UC_ProjectsPersonnel` (`projectID`,`sensorID`),
  KEY `sensorID` (`sensorID`),
  CONSTRAINT `projectsensors_ibfk_1` FOREIGN KEY (`projectID`) REFERENCES `Projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `projectsensors_ibfk_2` FOREIGN KEY (`sensorID`) REFERENCES `Sensors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Projects`
--

DROP TABLE IF EXISTS `Projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_Projects` (`name`,`userID`),
  KEY `userID` (`userID`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `Users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PublicDroneFiles`
--

DROP TABLE IF EXISTS `PublicDroneFiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PublicDroneFiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fileID` int(11) NOT NULL,
  `uploadDate` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`fileID`),
  KEY `fileID` (`fileID`),
  CONSTRAINT `publicdronefiles_ibfk_1` FOREIGN KEY (`fileID`) REFERENCES `DroneFiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Roles`
--

DROP TABLE IF EXISTS `Roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `personnelID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UC_Roles` (`personnelID`,`name`),
  CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`personnelID`) REFERENCES `Personnel` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=114 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SensorInventory`
--

DROP TABLE IF EXISTS `SensorInventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SensorInventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `inventory` varchar(255) DEFAULT NULL,
  `sensorID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sensorID` (`sensorID`),
  CONSTRAINT `sensorinventory_ibfk_1` FOREIGN KEY (`sensorID`) REFERENCES `Sensors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Sensors`
--

DROP TABLE IF EXISTS `Sensors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Sensors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `userID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sensors` (`name`,`userID`),
  KEY `userID` (`userID`),
  CONSTRAINT `sensors_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `Users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SharedDroneFiles`
--

DROP TABLE IF EXISTS `SharedDroneFiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SharedDroneFiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sharedWith_userID` int(11) NOT NULL,
  `uploadDate` varchar(255) NOT NULL,
  `fileID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_keys` (`sharedWith_userID`,`fileID`),
  KEY `sharedWith_userID` (`sharedWith_userID`),
  KEY `fileID` (`fileID`),
  CONSTRAINT `shareddronefiles_ibfk_3` FOREIGN KEY (`sharedWith_userID`) REFERENCES `Users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shareddronefiles_ibfk_4` FOREIGN KEY (`fileID`) REFERENCES `DroneFiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SharedProjects`
--

DROP TABLE IF EXISTS `SharedProjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SharedProjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`projectID`,`userID`),
  KEY `projectID` (`projectID`),
  KEY `userID` (`userID`),
  CONSTRAINT `sharedprojects_ibfk_1` FOREIGN KEY (`projectID`) REFERENCES `Projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sharedprojects_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-12-22 13:49:23
