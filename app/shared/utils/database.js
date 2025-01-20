import * as SQLite from "expo-sqlite";

let db = null;

export const openDatabase = () => {
  if (!db) db = SQLite.openDatabaseSync("examApp.db");
  return db;
};

export const initDatabase = async () => {
  try {
    db = openDatabase();

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL
      );
    `;

    const createExamsTable = `
      CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        duration INTEGER NOT NULL
      );
    `;

    const createQuestionsTable = `
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        examId INTEGER NOT NULL,
        text TEXT NOT NULL,
        options TEXT NOT NULL,
        correctOption INTEGER NOT NULL,
        explanation TEXT,
        points INTEGER DEFAULT 1,
        FOREIGN KEY (examId) REFERENCES exams (id)
      );
    `;

    const createResultsTable = `
      CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        examId INTEGER NOT NULL,
        studentId INTEGER NOT NULL,
        score INTEGER NOT NULL,
        answers TEXT NOT NULL,
        timeSpent INTEGER NOT NULL,
        examTitle TEXT NOT NULL,
        submittedAt TEXT,
        totalQuestions INTEGER NOT NULL,
        correctAnswers TEXT NOT NULL,
        FOREIGN KEY (examId) REFERENCES exams (id),
        FOREIGN KEY (studentId) REFERENCES users (id)
      );
    `;

    const createProgressTable = `
      CREATE TABLE IF NOT EXISTS quiz_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        examId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        answers TEXT,
        lastUpdated TEXT,
        timeLeft INTEGER,
        FOREIGN KEY (examId) REFERENCES exams (id),
        FOREIGN KEY (userId) REFERENCES users (id)
      );
    `;

    await db.execAsync(createUsersTable);
    await db.execAsync(createExamsTable);
    await db.execAsync(createQuestionsTable);
    await db.execAsync(createResultsTable);
    await db.execAsync(createProgressTable);

    const mockUsers = [
      {
        username: "instructor",
        password: "password123",
        name: "Instructor One",
        role: "instructor",
      },
      {
        username: "student",
        password: "password123",
        name: "Student One",
        role: "student",
      },
    ];

    for (const user of mockUsers) {
      const existingUser = await executeSql(
        "SELECT * FROM users WHERE username = ?",
        [user.username]
      );

      if (existingUser.rows.length === 0) {
        await executeSql(
          "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)",
          [user.username, user.password, user.name, user.role]
        );
      }
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

export const executeSql = async (sql, params = []) => {
  try {
    if (!db) db = openDatabase();
    if (!sql) throw new Error("SQL query is required");
    if (!Array.isArray(params)) throw new Error("Parameters must be an array");

    const processedParams = params.map((param) => {
      if (typeof param === "object" || Array.isArray(param))
        return JSON.stringify(param);
      return param;
    });

    if (sql.trim().toLowerCase().startsWith("select")) {
      const rows = await db.getAllAsync(sql, ...processedParams);
      return {
        rows: {
          _array: rows,
          length: rows.length,
        },
        insertId: null,
      };
    }

    if (
      sql.toLowerCase().includes("avg") &&
      sql.toLowerCase().includes("score")
    ) {
      const rows = await db.getAllAsync(sql, ...processedParams);
      return {
        rows: {
          _array: rows.map((row) => ({
            ...row,
            averageScore: row.averageScore
              ? parseFloat(row.averageScore)
              : null,
          })),
          length: rows.length,
        },
        insertId: null,
      };
    }

    const result = await db.runAsync(sql, ...processedParams);
    return {
      rows: {
        _array: [],
        length: 0,
      },
      insertId: result.lastInsertRowId || null,
    };
  } catch (error) {
    console.error("Error executing SQL:", error);
    throw error;
  }
};

export const saveQuizProgress = async (examId, userId, answers, timeLeft) => {
  try {
    if (!examId || !userId) throw new Error("Missing required fields");

    await executeSql(
      `INSERT OR REPLACE INTO quiz_progress 
       (examId, userId, answers, lastUpdated, timeLeft) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        examId,
        userId,
        JSON.stringify(answers),
        new Date().toISOString(),
        timeLeft || 0,
      ]
    );
  } catch (error) {
    console.error("Failed to save quiz progress:", error);
    throw error;
  }
};

export const getQuizProgress = async (examId, userId) => {
  try {
    const result = await executeSql(
      "SELECT * FROM quiz_progress WHERE examId = ? AND userId = ?",
      [examId, userId]
    );
    return result.rows._array[0];
  } catch (error) {
    console.error("Failed to get quiz progress:", error);
    return null;
  }
};
