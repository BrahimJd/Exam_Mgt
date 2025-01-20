import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/theme";

const QuestionReview = ({
  question,
  userAnswer,
  correctAnswer,
  questionNumber,
}) => {
  const isCorrect = userAnswer === correctAnswer;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.questionNumber}>Question {questionNumber}</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: isCorrect ? COLORS.success : COLORS.danger },
          ]}
        >
          <Text style={styles.badgeText}>
            {isCorrect ? "Correct" : "Incorrect"}
          </Text>
        </View>
      </View>

      <Text style={styles.questionText}>{question.text}</Text>

      {question.options.map((option, index) => (
        <View
          key={index}
          style={[
            styles.optionContainer,
            userAnswer === index && styles.selectedOption,
            correctAnswer === index && styles.correctOption,
          ]}
        >
          <Text
            style={[
              styles.optionText,
              userAnswer === index && styles.selectedOptionText,
              correctAnswer === index && styles.correctOptionText,
            ]}
          >
            {String.fromCharCode(65 + index)}. {option}
          </Text>
          {correctAnswer === index && (
            <Text style={styles.correctAnswerIndicator}>✓ Correct Answer</Text>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 16,
  },
  optionContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}15`,
  },
  correctOption: {
    borderColor: COLORS.success,
    backgroundColor: `${COLORS.success}15`,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  correctAnswerIndicator: {
    color: COLORS.success,
    fontWeight: "bold",
    marginTop: 4,
  },
});

export default QuestionReview;
