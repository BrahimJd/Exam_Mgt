import React, { useState, useEffect, useCallback } from "react";
import { Alert, StyleSheet, TouchableOpacity,View,Text,Alert,StyleSheet,TouchableOpacity } from "react-native";
import { useAuth } from "../shared/contexts/AuthContext";
import { useResults } from "../shared/contexts/ResultsContext";
import LoadingSpinner from "../shared/components/LoadingSpinner";
import { executeSql } from "../shared/utils/database";
import { getQuizProgress, saveQuizProgress } from "../shared/utils/database";
import { COLORS } from "../constants/theme";

const fetchExam = async (examId) => {
  try {
    const examResult = await executeSql("SELECT * FROM exams WHERE id = ?", [
      examId,
    ]);
    if (examResult.rows._array.length === 0) throw new Error("Exam not found");
    const exam = examResult.rows._array[0];

    const questionsResult = await executeSql(
      "SELECT * FROM questions WHERE examId = ?",
      [examId]
    );
    if (questionsResult.rows._array.length === 0)
      throw new Error("No questions found for this exam");

    const questions = questionsResult.rows._array.map((q) => ({
      ...q,
      options:
        typeof q.options === "string" ? JSON.parse(q.options) : q.options,
    }));

    return { ...exam, questions };
  } catch (error) {
    console.error("Fetch exam error:", error);
    throw new Error("Failed to fetch exam");
  }
};

const TakeExam = ({ route, navigation }) => {
  const { examId } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const { addResult } = useResults();

  const handleAnswer = (answer) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [currentQuestion]: answer };
      saveProgress(newAnswers, timeLeft);
      return newAnswers;
    });
  };

  const saveProgress = useCallback(
    async (answers, timeLeft) => {
      try {
        await saveQuizProgress(examId, user.id, answers, timeLeft);
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    },
    [examId, user.id]
  );

  useEffect(() => {
    return () => {
      if (answers && Object.keys(answers).length > 0) {
        saveProgress(answers, timeLeft);
      }
    };
  }, [answers, timeLeft]);

  useEffect(() => {
    loadExam();
  }, [examId]);

  const loadExam = async () => {
    try {
      setLoading(true);
      const examData = await fetchExam(examId);
      if (!examData.questions || examData.questions.length === 0)
        throw new Error("No questions available for this exam");

      const progress = await getQuizProgress(examId, user.id);
      if (progress?.answers) {
        const savedAnswers = JSON.parse(progress.answers);
        setAnswers(savedAnswers);
        setTimeLeft(progress.timeLeft);
      } else {
        setTimeLeft(examData.duration * 60);
      }

      setExam(examData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (exam) setTimeLeft(exam.duration * 60);
  }, [exam]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft]);

  const handleSubmit = async () => {
    try {
      if (!exam || !user) {
        Alert.alert("Error", "Unable to submit exam");
        return;
      }

      const answersArray = Object.values(answers);
      if (answersArray.length !== exam.questions.length) {
        Alert.alert("Error", "Please answer all questions");
        return;
      }

      const result = {
        examId: exam.id,
        studentId: user.id,
        answers: answersArray,
        timeSpent: exam.duration * 60 - timeLeft,
        examTitle: exam.title,
        correctAnswers: exam.questions.map((q) => q.correctOption),
        questions: exam.questions,
      };

      await addResult(result);
      navigation.replace("MyResults");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          color={COLORS.primary}
        />
        <Button title="Retry" onPress={loadExam} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of {exam.questions.length}
        </Text>
        <Text style={styles.timer}>
          Time: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </Text>
      </View>

      <View style={styles.questionSection}>
        <Text style={styles.questionText}>
          {exam.questions[currentQuestion].text}
        </Text>
        {exam.questions[currentQuestion].options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              answers[currentQuestion] === index && styles.selectedOption,
            ]}
            onPress={() => handleAnswer(index)}
          >
            <Text
              style={[
                styles.optionText,
                answers[currentQuestion] === index && styles.selectedOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestion === 0 && styles.disabledButton,
          ]}
          onPress={() => setCurrentQuestion((prev) => prev - 1)}
          disabled={currentQuestion === 0}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>

        {currentQuestion === exam.questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentQuestion((prev) => prev + 1)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  progressBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 20,
  },
  questionSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 24,
    color: COLORS.text,
  },
  option: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectedOptionText: {
    color: COLORS.white,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: "center",
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: COLORS.border,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
});

export default TakeExam;
