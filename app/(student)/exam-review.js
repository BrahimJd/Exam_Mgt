import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import QuestionReview from "../shared/components/QuestionReview";
import { COLORS } from "../constants/theme";

const ExamReview = ({ route }) => {
  const { exam, userAnswers, correctAnswers } = route.params;

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return COLORS.success;
    if (percentage >= 70) return COLORS.warning;
    return COLORS.danger;
  };

  const score = userAnswers.filter(
    (ans, i) => ans === correctAnswers[i]
  ).length;
  const percentage = Math.round((score / exam.questions.length) * 100);
  const scoreColor = getScoreColor(percentage);

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.scoreCard, { borderColor: scoreColor }]}>
        <Text style={styles.scoreText}>Your Score</Text>
        <Text style={[styles.scoreValue, { color: scoreColor }]}>
          {score}/{exam.questions.length}
        </Text>
        <Text style={[styles.percentageText, { color: scoreColor }]}>
          {percentage}%
        </Text>
      </View>

      {exam.questions.map((question, index) => (
        <QuestionReview
          key={index}
          question={question}
          userAnswer={userAnswers[index]}
          correctAnswer={correctAnswers[index]}
          questionNumber={index + 1}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  scoreCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 2,
  },
  scoreText: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: "500",
  },
});

export default ExamReview;
