import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { executeSql } from "../shared/utils/database";
import LoadingSpinner from "../shared/components/LoadingSpinner";
import { useAuth } from "../shared/contexts/AuthContext";
import { COLORS } from "../constants/theme";
import { useLogoutNavigation } from "../shared/hooks/handleLogout";

const InstructorDashboard = () => {
  const navigation = useNavigation();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  const { handleLogout, isLoggingOut } = useLogoutNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          disabled={isLoggingOut}
        >
          <Text style={[styles.logoutText, isLoggingOut && { opacity: 0.5 }]}>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleLogout, isLoggingOut]);

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true);
        const result = await executeSql(
          `SELECT 
            e.*,
            COUNT(DISTINCT r.studentId) as totalStudents,
            ROUND(AVG(CAST(r.score * 100.0 / r.totalQuestions AS FLOAT)), 1) as averageScore
          FROM exams e 
          LEFT JOIN results r ON e.id = r.examId 
          GROUP BY e.id`
        );
        setExams(result.rows._array);
      } catch (error) {
        console.error("Failed to load exams:", error);
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, []);

  if (loading) return <LoadingSpinner />;

  const renderExamCard = ({ item }) => (
    <TouchableOpacity
      style={styles.examCard}
      onPress={() => navigation.navigate("ViewResults", { examId: item.id })}
    >
      <Text style={styles.examTitle}>{item.title}</Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Students</Text>
          <Text style={styles.statValue}>{item.totalStudents || 0}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Avg. Score</Text>
          <Text style={styles.statValue}>
            {item.averageScore ? `${item.averageScore}%` : "N/A"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CreateExam")}
      >
        <Text style={styles.createButtonText}>Create New Exam</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Your Exams</Text>

      <FlatList
        data={exams}
        renderItem={renderExamCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.examList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  createButton: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  examList: {
    gap: 16,
  },
  examCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.1)",
    elevation: 3,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
  },
  logoutButton: {
    marginRight: 16,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 4,
  },
});

export default InstructorDashboard;
