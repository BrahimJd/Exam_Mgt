import React, { useEffect, useState } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ResultCard from "../shared/components/ResultCard";
import { useAuth } from "../shared/contexts/AuthContext";
import { executeSql } from "../shared/utils/database";
import { Alert } from "react-native";
import LoadingSpinner from "../shared/components/LoadingSpinner";

const MyResults = () => {
  const { user } = useAuth();
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchExam = async (examId) => {
    try {
      const [examResult, questionsResult] = await Promise.all([
        executeSql("SELECT * FROM exams WHERE id = ?", [examId]),
        executeSql("SELECT * FROM questions WHERE examId = ?", [examId]),
      ]);

      if (examResult.rows._array.length === 0)
        throw new Error("Exam not found");

      const exam = examResult.rows._array[0];
      const questions = questionsResult.rows._array.map((q) => ({
        ...q,
        options: JSON.parse(q.options),
      }));

      return { ...exam, questions };
    } catch (error) {
      throw new Error("Failed to fetch exam");
    }
  };

  const handleReviewPress = async (examId, result) => {
    try {
      const exam = await fetchExam(examId);
      if (!exam?.questions) throw new Error("No questions available");

      navigation.navigate("ExamReview", {
        exam,
        userAnswers: result.answers,
        correctAnswers: result.correctAnswers,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to load exam review");
    }
  };

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        const result = await executeSql(
          `SELECT r.*, e.title as examTitle, 
           (SELECT COUNT(*) FROM questions WHERE examId = r.examId) as totalQuestions
           FROM results r 
           JOIN exams e ON r.examId = e.id 
           WHERE r.studentId = ?
           ORDER BY r.submittedAt DESC`,
          [user.id]
        );

        const processedResults = result.rows._array.map((r) => ({
          ...r,
          answers: JSON.parse(r.answers || "[]"),
          correctAnswers: JSON.parse(r.correctAnswers || "[]"),
          score: parseInt(r.score),
          totalQuestions: parseInt(r.totalQuestions),
        }));

        setUserResults(processedResults);
      } catch (error) {
        console.error("Failed to load results:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [user.id]);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Exam Results</Text>
      {userResults.length === 0 ? (
        <Text style={styles.noResults}>No exam results yet</Text>
      ) : (
        <FlatList
          data={userResults}
          renderItem={({ item }) => (
            <ResultCard
              examTitle={item.examTitle}
              score={item.score}
              totalQuestions={item.totalQuestions}
              timeTaken={item.timeSpent / 60}
              submittedAt={item.submittedAt}
              answers={item.answers}
              correctAnswers={item.correctAnswers}
              showDetails={true}
              onReviewPress={() => handleReviewPress(item.examId, item)}
            />
          )}
          keyExtractor={(item) => `result-${item.examId}-${item.submittedAt}`}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  noResults: {
    fontSize: 16,
    color: "#666",
  },
});

export default MyResults;
