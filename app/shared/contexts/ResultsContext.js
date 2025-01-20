import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { executeSql } from "../utils/database";

const ResultsContext = createContext(null);

const ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_RESULTS: "SET_RESULTS",
  ADD_RESULT: "ADD_RESULT",
  CLEAR_ERROR: "CLEAR_ERROR",
};

const initialState = {
  examResults: [],
  loading: false,
  error: null,
};

function resultsReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.SET_RESULTS:
      return { ...state, examResults: action.payload, loading: false };
    case ACTIONS.ADD_RESULT:
      return {
        ...state,
        examResults: [...state.examResults, action.payload],
        loading: false,
      };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}

const calculateScoreDistribution = (results) => {
  const distribution = {
    "0-59": 0,
    "60-69": 0,
    "70-79": 0,
    "80-89": 0,
    "90-100": 0,
  };

  results.forEach((result) => {
    const percentage = (result.score / result.totalQuestions) * 100;
    if (percentage < 60) distribution["0-59"]++;
    else if (percentage < 70) distribution["60-69"]++;
    else if (percentage < 80) distribution["70-79"]++;
    else if (percentage < 90) distribution["80-89"]++;
    else distribution["90-100"]++;
  });

  return distribution;
};

const calculateScore = (answers = [], correctAnswers = []) => {
  return answers.reduce((total, answer, index) => {
    return answer === correctAnswers[index] ? total + 1 : total;
  }, 0);
};

export const ResultsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(resultsReducer, initialState);

  const loadResults = useCallback(async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      const result = await executeSql("SELECT * FROM results");
      dispatch({ type: ACTIONS.SET_RESULTS, payload: result.rows._array });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: "Failed to load results" });
    }
  }, []);

  const addResult = useCallback(async (result) => {
    try {
      if (!result.examId || !result.studentId)
        throw new Error("Missing required result fields");

      const score = calculateScore(
        result.answers,
        result.correctAnswers,
        result.questions
      );

      const insertResult = await executeSql(
        `INSERT INTO results (
          examId, studentId, score, answers, 
          timeSpent, submittedAt, examTitle,
          totalQuestions, correctAnswers
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          result.examId,
          result.studentId,
          score,
          JSON.stringify(result.answers),
          result.timeSpent,
          new Date().toISOString(),
          result.examTitle,
          result.answers.length,
          JSON.stringify(result.correctAnswers),
        ]
      );

      await executeSql(
        "DELETE FROM quiz_progress WHERE examId = ? AND userId = ?",
        [result.examId, result.studentId]
      );

      return { ...result, id: insertResult.insertId, score };
    } catch (error) {
      throw error;
    }
  }, []);

  const getResultsByExam = useCallback(async (examId) => {
    try {
      const result = await executeSql(
        "SELECT * FROM results WHERE examId = ?",
        [examId]
      );
      return result.rows._array;
    } catch (error) {
      console.error("Failed to fetch results by exam:", error);
      return [];
    }
  }, []);

  const getExamStatistics = useCallback(async (examId) => {
    try {
      const result = await executeSql(
        `SELECT 
          r.*,
          e.title as examTitle,
          u.name as studentName,
          ROUND(CAST(r.score * 100.0 / r.totalQuestions AS FLOAT), 1) as percentage
        FROM results r 
        JOIN exams e ON r.examId = e.id 
        JOIN users u ON r.studentId = u.id
        WHERE r.examId = ?
        ORDER BY r.submittedAt DESC`,
        [examId]
      );

      const results = result.rows._array;
      if (results.length === 0) return null;

      return {
        averageScore: Math.round(
          results.reduce((acc, r) => acc + r.percentage, 0) / results.length
        ),
        highestScore: Math.round(Math.max(...results.map((r) => r.percentage))),
        lowestScore: Math.round(Math.min(...results.map((r) => r.percentage))),
        totalStudents: results.length,
        scoreDistribution: calculateScoreDistribution(results),
      };
    } catch (error) {
      console.error("Failed to fetch exam statistics:", error);
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  return (
    <ResultsContext.Provider
      value={{
        ...state,
        loadResults,
        addResult,
        getExamStatistics,
        clearError,
        getResultsByExam,
      }}
    >
      {children}
    </ResultsContext.Provider>
  );
};

export const useResults = () => {
  const context = useContext(ResultsContext);
  if (!context)
    throw new Error("useResults must be used within a ResultsProvider");
  return context;
};
