import React, { useState } from "react";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { COLORS } from "../constants/theme";
import { executeSql } from "../shared/utils/database";

export const CreateExam = ({ navigation }) => {
  const [examData, setExamData] = useState({
    title: "",
    duration: "",
    questions: [],
  });
  const [loading, setLoading] = useState(false);

  const handleSaveExam = async () => {
    try {
      if (!examData.title.trim()) {
        Alert.alert("Error", "Please enter exam title");
        return;
      }

      const duration = parseInt(examData.duration);
      if (!duration || duration <= 0) {
        Alert.alert("Error", "Please enter a valid duration");
        return;
      }

      if (examData.questions.length === 0) {
        Alert.alert("Error", "Please add at least one question");
        return;
      }

      for (let i = 0; i < examData.questions.length; i++) {
        const question = examData.questions[i];

        if (!question.text.trim()) {
          Alert.alert("Error", `Question ${i + 1} text is required`);
          return;
        }

        if (question.options.some((opt) => !opt.trim())) {
          Alert.alert(
            "Error",
            `All options for question ${i + 1} must be filled`
          );
          return;
        }

        if (question.correctOption === null) {
          Alert.alert(
            "Error",
            `Please select correct answer for question ${i + 1}`
          );
          return;
        }
      }

      setLoading(true);

      const examResult = await executeSql(
        "INSERT INTO exams (title, duration) VALUES (?, ?)",
        [examData.title, duration]
      );

      const examId = examResult.insertId;

      for (const question of examData.questions) {
        await executeSql(
          "INSERT INTO questions (examId, text, options, correctOption) VALUES (?, ?, ?, ?)",
          [
            examId,
            question.text,
            JSON.stringify(question.options),
            question.correctOption,
          ]
        );
      }

      Alert.alert("Success", "Exam created successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error saving exam:", error);
      Alert.alert("Error", "Failed to save exam");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      text: "",
      options: ["", ""],
      correctOption: null,
    };
    setExamData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const handleAddOption = (questionIndex) => {
    const newQuestions = [...examData.questions];
    newQuestions[questionIndex].options.push("");
    setExamData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const newQuestions = [...examData.questions];
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex].options.splice(optionIndex, 1);
      if (newQuestions[questionIndex].correctOption === optionIndex) {
        newQuestions[questionIndex].correctOption = null;
      }
      setExamData((prev) => ({ ...prev, questions: newQuestions }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.titleInput}
          placeholder="Exam Title"
          value={examData.title}
          onChangeText={(title) => setExamData((prev) => ({ ...prev, title }))}
        />
        <TextInput
          style={styles.durationInput}
          placeholder="Duration (minutes)"
          keyboardType="numeric"
          value={examData.duration}
          onChangeText={(duration) =>
            setExamData((prev) => ({ ...prev, duration }))
          }
        />
      </View>

      <View style={styles.questionsList}>
        {examData.questions.map((question, index) => (
          <View key={index} style={styles.questionCard}>
            <Text style={styles.questionNumber}>Question {index + 1}</Text>

            <TextInput
              style={styles.questionInput}
              placeholder="Enter question"
              value={question.text}
              onChangeText={(text) => {
                const newQuestions = [...examData.questions];
                newQuestions[index].text = text;
                setExamData((prev) => ({ ...prev, questions: newQuestions }));
              }}
              multiline
            />

            {question.options.map((option, optIndex) => (
              <View key={optIndex} style={styles.optionRow}>
                <TextInput
                  style={[
                    styles.optionInput,
                    question.correctOption === optIndex && styles.correctOption,
                  ]}
                  placeholder={`Option ${optIndex + 1}`}
                  value={option}
                  onChangeText={(text) => {
                    const newQuestions = [...examData.questions];
                    newQuestions[index].options[optIndex] = text;
                    setExamData((prev) => ({
                      ...prev,
                      questions: newQuestions,
                    }));
                  }}
                />
                <TouchableOpacity
                  style={[
                    styles.correctButton,
                    question.correctOption === optIndex &&
                      styles.correctButtonSelected,
                  ]}
                  onPress={() => {
                    const newQuestions = [...examData.questions];
                    newQuestions[index].correctOption = optIndex;
                    setExamData((prev) => ({
                      ...prev,
                      questions: newQuestions,
                    }));
                  }}
                >
                  <Text style={styles.checkmark}>✓</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveOption(index, optIndex)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addOptionButton}
              onPress={() => handleAddOption(index)}
            >
              <Text style={styles.addOptionText}>+ Add Option</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddQuestion}>
        <Text style={styles.buttonText}>Add New Question</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSaveExam}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Create Exam"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 16,
  },
  durationInput: {
    fontSize: 16,
  },
  questionsList: {
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: COLORS.secondary,
  },
  questionInput: {
    fontSize: 16,
    marginBottom: 16,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginRight: 8,
  },
  correctOption: {
    borderColor: COLORS.success,
  },
  correctButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  correctButtonSelected: {
    backgroundColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 16,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
  },
  removeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  addOptionButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    alignItems: "center",
    marginTop: 8,
  },
  addOptionText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: COLORS.success,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 32,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default CreateExam;
