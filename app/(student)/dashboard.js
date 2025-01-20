import React, { useState, useEffect, useCallback } from "react";
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
import ErrorView from "../shared/components/ErrorView";
import { useAuth } from "../shared/contexts/AuthContext";
import { COLORS } from "../constants/theme";
import { useLogoutNavigation } from "../shared/hooks/handleLogout";

const StudentDashboard = () => {
  const navigation = useNavigation();
  const [availableExams, setAvailableExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExams();
    setRefreshing(false);
  }, []);

  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      const result = await executeSql(
        `SELECT e.*, COUNT(q.id) as questions 
         FROM exams e 
         LEFT JOIN questions q ON e.id = q.examId 
         GROUP BY e.id`
      );
      setAvailableExams(result.rows._array);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorView message={error} />;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Available Exams</Text>
      <FlatList
        refreshing={refreshing}
        onRefresh={onRefresh}
        data={availableExams}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.examCard}
            onPress={() => navigation.navigate("TakeExam", { examId: item.id })}
          >
            <Text style={styles.examTitle}>{item.title}</Text>
            <View style={styles.statsRow}>
              <Text>Duration: {item.duration} mins</Text>
              <Text>Questions: {item.questions}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      <TouchableOpacity
        style={styles.viewResultsButton}
        onPress={() => navigation.navigate("MyResults")}
      >
        <Text style={styles.buttonText}>View My Results</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  examCard: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewResultsButton: {
    backgroundColor: "#007BFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
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

export default StudentDashboard;
