# Attendance Management System

## 📖 Overview

The **Attendance Management System** is an intelligent solution designed to automate student attendance using **facial recognition**. The system eliminates manual attendance by detecting students' faces through a camera scan and automatically marking them as **present** or **absent**.

The project is composed of three main modules:

- 🌐 **Web Application**
- 📱 **Mobile Application**
- 🤖 **Face Recognition System**

Together, these components provide a complete attendance management platform for educational institutions.

---

## 🚀 Features

### 🌐 Web Application
- User authentication and role management (Administrator, Teacher, Student)
- Student, teacher, department, and course management
- Attendance history
- Justification management for absences
- Dashboard and statistics
- Automatic notifications

### 📱 Mobile Application
- Secure login
- Student attendance history
- Attendance scanning interface for teachers
- Real-time notifications
- Profile management

### 🤖 Face Recognition System
- Real-time face detection
- Student face recognition
- Automatic attendance marking
- Face encoding generation and management
- High recognition accuracy
- REST API integration with the backend

---

## ⚙️ How It Works

1. A teacher starts an attendance session.
2. The camera scans the classroom.
3. The Face Recognition module detects and recognizes students.
4. Recognized students are automatically marked as **Present**.
5. Students who are not detected are automatically marked as **Absent**.
6. Attendance records are saved in the database.
7. Notifications are sent automatically to the corresponding users.

---

## 📂 Project Structure

```
Attendance-Management-System/
│
├── web/
│   ├── backend/
│   ├── frontend/
│   └── docker-compose.yaml
│
├── mobile/
│   └── mobile_app/
│
├── face-recognition/
│   ├── face_attendance/
│   ├── faceencoding/
│   ├── face_api.py
│   └── Test/
│
└── README.md
```

---

## 🛠️ Technologies

### Backend
- Django
- Django REST Framework
- PostgreSQL
- Docker

### Frontend
- Angular

### Mobile
- React Native

### Face Recognition
- Python
- OpenCV
- InsightFace
- ONNX Runtime

---

## 🎯 Main Objective

The primary goal of this project is to simplify and automate attendance management by replacing traditional manual attendance with an intelligent facial recognition system.

The system provides:

- ✅ Fast attendance taking
- ✅ Accurate face recognition
- ✅ Automatic absence detection
- ✅ Attendance history
- ✅ Automatic notifications
- ✅ Easy management through web and mobile applications

---

## 📄 License

This project is intended for educational and research purposes.
