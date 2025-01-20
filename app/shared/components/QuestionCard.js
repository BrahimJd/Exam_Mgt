import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { COLORS } from "../../constants/theme";

const QuestionCard = ({
  question = "",
  options = [],
  onAnswer,
  questionNumber,
  selectedAnswer,
  difficulty = "easy",
  timeLimit,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [question]);

  useEffect(() => {
    if (selectedAnswer !== null) setSelectedOption(selectedAnswer);
  }, [selectedAnswer]);

  useEffect(() => {
    setTimeRemaining(timeLimit);
  }, [question]);

  useEffect(() => {
    if (timeLimit && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onAnswer(selectedOption);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLimit, timeRemaining]);

  const handleOptionSelect = (index) => {
    if (timeRemaining === 0) return;
    setSelectedOption(index);
    onAnswer?.(index);
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case "easy":
        return COLORS.success;
      case "medium":
        return COLORS.warning;
      case "hard":
        return COLORS.danger;
      default:
        return COLORS.secondary;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.questionNumber}>Question {questionNumber}</Text>
        {difficulty && (
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor() },
            ]}
          >
            <Text style={styles.difficultyText}>{difficulty}</Text>
          </View>
        )}
        {timeLimit && (
          <Text
            style={[styles.timer, timeRemaining < 30 && styles.timerWarning]}
          >
            {formatTime(timeRemaining)}
          </Text>
        )}
      </View>

      <Text style={styles.questionText}>{question}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              selectedOption === index && styles.selectedOption,
            ]}
            onPress={() => handleOptionSelect(index)}
            disabled={timeRemaining === 0}
          >
            <Text style={styles.optionLabel}>
              {String.fromCharCode(65 + index)}.
            </Text>
            <Text
              style={[
                styles.optionText,
                selectedOption === index && styles.selectedOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: COLORS.white,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 24,
    lineHeight: 24,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: "500",
  },
});

export default QuestionCard;
