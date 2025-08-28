bookingSystem

A comprehensive backend API system for managing appointments between students and professors, built with Node.js, Express.js, MongoDB, and automated testing.

##  Features

### Core Functionality
- **User Authentication**: JWT-based authentication for students and professors
- **Role-Based Access Control**: Separate permissions for students and professors
- **Availability Management**: Professors can create and manage their available time slots
- **Appointment Booking**: Students can view and book available appointments
- **Appointment Cancellation**: Both students and professors can cancel appointments
- **Real-time Availability Updates**: Time slots automatically become unavailable when booked

### Technical Features
- **Database Transactions**: Ensures data consistency during booking/cancellation
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Robust error handling with meaningful error messages
- **Database Relationships**: Proper MongoDB relationships between users, availability, and appointments
- **Automated Testing**: Complete E2E test suite covering the entire user flow

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd college-appointment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/college_appointments
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

##  Testing

### Run All Tests
```bash
npm test
```

### Run E2E Tests Only
```bash
npm run test:e2e
```

### Test Coverage
The automated test covers the complete user flow:
1. Student A1 authentication
2. Professor P1 authentication
3. Professor P1 creates availability slots
4. Student A1 views available slots
5. Student A1 books appointment for time T1
6. Student A2 authentication
7. Student A2 books appointment for time T2
8. Professor P1 cancels appointment with Student A1
9. Student A1 verifies no pending appointments

##  API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "password123",
  "role": "student", // or "professor"
  "department": "Computer Science" // required for professors only
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@college.edu",
  "password": "password123"
}
```

### Professor Endpoints

#### Create Availability
```http
POST /api/professor/availability
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "startTime": "2024-12-15T10:00:00.000Z",
  "endTime": "2024-12-15T11:00:00.000Z"
}
```

#### Get Professor's Availability
```http
GET /api/professor/availability
Authorization: Bearer <jwt_token>
```

#### Get Professor's Appointments
```http
GET /api/professor/appointments?status=scheduled
Authorization: Bearer <jwt_token>
```

### Student Endpoints

#### Get All Professors
```http
GET /api/student/professors
Authorization: Bearer <jwt_token>
```

#### Get Professor's Available Slots
```http
GET /api/student/professors/{professorId}/availability
Authorization: Bearer <jwt_token>
```

#### Get Student's Appointments
```http
GET /api/student/appointments?status=scheduled
Authorization: Bearer <jwt_token>
```

### Appointment Endpoints

#### Book Appointment
```http
POST /api/appointments/book
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "availabilityId": "availability_id_here",
  "notes": "Discussion about project"
}
```

#### Cancel Appointment
```http
PUT /api/appointments/{appointmentId}/cancel
Authorization: Bearer <jwt_token>
```

#### Get Appointment Details
```http
GET /api/appointments/{appointmentId}
Authorization: Bearer <jwt_token>
```


```

### Key Design Decisions
1. **Separation of Concerns**: Routes are organized by user role and functionality
2. **Database Transactions**: Critical operations use MongoDB transactions for consistency
3. **JWT Authentication**: Stateless authentication with role-based access control
4. **Input Validation**: Comprehensive validation at the API level
5. **Error Handling**: Centralized error handling with meaningful messages

##  Security Features

- Password hashing using bcryptjs
- JWT-based stateless authentication
- Role-based access control
- Input validation and sanitization
- Database transaction consistency
- Authorization checks on all protected routes

##  Testing Strategy

### E2E Test Coverage
- Complete user authentication flow
- Professor availability management
- Student booking process
- Appointment cancellation workflow
- Data consistency verification
- Edge case handling




