# Exam Management App

## Overview

This is a React Native application designed to manage exams for both students and instructors. The app allows instructors to create exams, view results, and analyze student performance. Students can take exams, view their results, and review their answers.

---

## Features

### Authentication

- **Login**: Users can log in with their username and password.
- **Register**: New users can register with a username, password, name, and role (student or instructor).

### Student Features

- **Dashboard**: View available exams and navigate to take an exam or view results.
- **Take Exam**: Take an exam with a timer, save progress, and submit answers.
- **My Results**: View past exam results and review answers.
- **Exam Review**: Review individual exam results with correct and incorrect answers highlighted.

### Instructor Features

- **Dashboard**: View a list of created exams with statistics like average score and number of students.
- **Create Exam**: Create new exams with multiple questions and options.
- **View Results**: View detailed statistics and individual results for each exam.

---

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/exam-management-app.git
   cd exam-management-app
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the app**:

   ```bash
   npx expo start
   ```

4. **Open the app**:
   - Use the Expo Go app on your mobile device to scan the QR code.
   - Alternatively, run on an emulator or simulator.

---

## Database

The app uses SQLite for local storage. The database is initialized with the following tables:

- **users**: Stores user information (username, password, name, role).
- **exams**: Stores exam information (title, duration).
- **questions**: Stores questions for each exam (text, options, correctOption).
- **results**: Stores exam results (studentId, examId, score, answers, timeSpent).
- **quiz_progress**: Stores progress for ongoing exams (userId, examId, answers, timeLeft).

---

## Components

### Shared Components

- **LoadingSpinner**: Displays a loading spinner.
- **ErrorView**: Displays an error message with a retry button.
- **ExamNavigation**: Provides navigation buttons for exams (Previous, Next, Submit).
- **ResultCard**: Displays exam results with score, time taken, and date.
- **QuestionReview**: Displays a question with correct and incorrect answers highlighted.

### Contexts

- **AuthContext**: Manages user authentication state (login, register, logout).
- **ResultsContext**: Manages exam results and statistics.

### Hooks

- **useLogoutNavigation**: Handles logout functionality with navigation.

---

## Screens

### Authentication

- **Login**: Login screen for users.
- **Register**: Registration screen for new users.

### Student Screens

- **StudentDashboard**: Dashboard for students to view available exams and results.
- **TakeExam**: Screen for taking an exam.
- **MyResults**: Screen to view past exam results.
- **ExamReview**: Screen to review individual exam results.

### Instructor Screens

- **InstructorDashboard**: Dashboard for instructors to view exam statistics.
- **CreateExam**: Screen to create new exams.
- **ViewResults**: Screen to view detailed exam results and statistics.

---

## Navigation

The app uses `@react-navigation/native` for navigation. The main navigation stack is defined in `App.js` with the following routes:

- **Login**: Initial route for user login.
- **Register**: Route for user registration.
- **StudentDashboard**: Dashboard for students.
- **TakeExam**: Route for taking an exam.
- **MyResults**: Route for viewing student results.
- **InstructorDashboard**: Dashboard for instructors.
- **CreateExam**: Route for creating exams.
- **ViewResults**: Route for viewing exam results.

---
## Styling

The app uses a consistent color scheme defined in `app/constants/theme.js`. Styles are defined using `StyleSheet` in each component.

---

## Dependencies

- **React Native**: Core framework for building the app.
- **Expo**: Development platform for React Native.
- **SQLite**: Local database for storing exam data.
- **React Navigation**: Navigation library for React Native.
- **React Native Chart Kit**: Library for displaying charts (used in ViewResults).
