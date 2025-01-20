import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/theme";

const ExamNavigation = ({
  isFirst,
  isLast,
  onPrevious,
  onNext,
  onSubmit,
  answeredQuestions,
  totalQuestions,
  currentQuestion,
}) => {
  const totalAnswered = Object.keys(answeredQuestions).length;
  const isCurrentAnswered = answeredQuestions[currentQuestion] !== undefined;
  const canMoveNext = !isLast && isCurrentAnswered;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isFirst && styles.disabledButton]}
        onPress={onPrevious}
        disabled={isFirst}
      >
        <Text style={[styles.buttonText, isFirst && styles.disabledText]}>
          Previous
        </Text>
      </TouchableOpacity>

      {isLast ? (
        <TouchableOpacity
          style={[
            styles.button,
            totalAnswered < totalQuestions && styles.disabledButton,
          ]}
          onPress={onSubmit}
          disabled={totalAnswered < totalQuestions}
        >
          <Text style={styles.buttonText}>
            Submit ({totalAnswered}/{totalQuestions})
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, !canMoveNext && styles.disabledButton]}
          onPress={onNext}
          disabled={!canMoveNext}
        >
          <Text
            style={[styles.buttonText, !canMoveNext && styles.disabledText]}
          >
            Next
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 12,
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
    fontSize: 16,
  },
  disabledText: {
    color: "#999",
  },
});

export default ExamNavigation;
