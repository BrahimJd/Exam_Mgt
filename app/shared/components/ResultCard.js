import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/theme";

const getScoreColor = (percentage) => {
  if (percentage >= 90) return COLORS.success;
  if (percentage >= 70) return COLORS.warning;
  return COLORS.danger;
};

const ResultCard = ({
  examTitle,
  score,
  totalQuestions,
  timeTaken,
  submittedAt,
  onReviewPress,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const scoreColor = getScoreColor(percentage);

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: scoreColor }]}
      onPress={onReviewPress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{examTitle}</Text>
        <View style={[styles.badge, { backgroundColor: scoreColor }]}>
          <Text style={styles.badgeText}>{percentage}%</Text>
        </View>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Score</Text>
          <Text style={[styles.detailValue, { color: scoreColor }]}>
            {score}/{totalQuestions}
          </Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Time Taken</Text>
          <Text style={styles.detailValue}>{Math.floor(timeTaken)}min</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>
            {new Date(submittedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
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
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detail: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
});

export default ResultCard;
