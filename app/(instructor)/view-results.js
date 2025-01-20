import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { COLORS } from "../constants/theme";
import { useResults } from "../shared/contexts/ResultsContext";
import LoadingSpinner from "../shared/components/LoadingSpinner";
import ResultCard from "../shared/components/ResultCard";

const ViewResults = ({ route }) => {
  const { examId } = route.params;
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getExamStatistics, getResultsByExam } = useResults();

  const prepareChartData = (distribution) => {
    if (!distribution) return [];

    const colors = [
      "#FF6B6B", // 0-59
      "#FFA94D", // 60-69
      "#FFD93D", // 70-79
      "#A8E6CF", // 80-89
      "#69DB7C", // 90-100
    ];

    return Object.entries(distribution).map(([label, value], index) => ({
      name: label,
      population: value,
      color: colors[index],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));
  };

  const calculateScoreDistribution = useCallback((results) => {
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
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      const distribution = calculateScoreDistribution(results);
      setStats((prevStats) => ({
        ...prevStats,
        scoreDistribution: distribution,
      }));
    }
  }, [results, calculateScoreDistribution]);

  useEffect(() => {
    const loadExamResults = async () => {
      try {
        setLoading(true);
        const [examStats, examResults] = await Promise.all([
          getExamStatistics(examId),
          getResultsByExam(examId),
        ]);
        setStats(examStats);
        setResults(examResults);
      } catch (error) {
        console.error("Error loading results:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExamResults();
  }, [examId, getExamStatistics, getResultsByExam]);

  if (loading) return <LoadingSpinner />;

  if (!stats || !results.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.noResults}>No results available for this exam</Text>
      </View>
    );
  }

  const chartData = prepareChartData(stats.scoreDistribution);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.header}>Exam Statistics</Text>
        <View style={styles.statsGrid}>
          <StatBox label="Total Students" value={stats.totalStudents} />
          <StatBox label="Average Score" value={`${stats.averageScore}%`} />
          <StatBox label="Highest Score" value={`${stats.highestScore}%`} />
          <StatBox label="Lowest Score" value={`${stats.lowestScore}%`} />
        </View>

        <Text style={styles.subHeader}>Score Distribution</Text>
        <View style={styles.chartContainer}>
          <ChartWithErrorBoundary data={chartData} />
        </View>
      </View>

      <Text style={styles.subHeader}>Individual Results</Text>
      {results.map((result) => (
        <ResultCard
          key={`${result.studentId}-${result.submittedAt}`}
          examTitle={`${result.studentName} - ${result.examTitle}`}
          score={result.score}
          totalQuestions={result.totalQuestions}
          timeTaken={result.timeSpent / 60}
          submittedAt={result.submittedAt}
        />
      ))}
    </ScrollView>
  );
};

const ChartWithErrorBoundary = ({ data }) => {
  if (!data || data.length === 0) {
    return <Text style={styles.noDataText}>No data available for chart</Text>;
  }

  try {
    return (
      <PieChart
        data={data}
        width={300}
        height={200}
        chartConfig={{
          backgroundColor: COLORS.white,
          backgroundGradientFrom: COLORS.white,
          backgroundGradientTo: COLORS.white,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          strokeWidth: 2,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    );
  } catch (error) {
    console.error("Chart error:", error);
    return <Text style={styles.errorText}>Failed to load chart</Text>;
  }
};

const StatBox = ({ label, value }) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  noResults: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: "center",
    marginTop: 24,
  },
  statsContainer: {
    marginBottom: 32,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.text,
  },
  statBox: {
    width: "48%",
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  statLabel: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 4,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    elevation: 2,
  },
  noDataText: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: "center",
    marginTop: 24,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
    marginTop: 24,
  },
});

export default ViewResults;
