import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../shared/contexts/AuthContext";
import { COLORS } from "../constants/theme";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      if (!username || !password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      setLoading(true);
      const user = await login(username, password);

      if (!user?.role) {
        throw new Error("Invalid user data");
      }

      const route =
        user.role === "student" ? "StudentDashboard" : "InstructorDashboard";
      navigation.reset({ index: 0, routes: [{ name: route }] });
    } catch (error) {
      Alert.alert("Error", error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? "Loading..." : "Login"}
        onPress={handleLogin}
        disabled={loading}
      />
      <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
        Don't have an account? Register
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: COLORS.white,
  },
  link: {
    marginTop: 15,
    color: COLORS.primary,
    textAlign: "center",
  },
});
