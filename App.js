import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Login from "./app/(auth)/login";
import Register from "./app/(auth)/register";
import StudentDashboard from "./app/(student)/dashboard";
import TakeExam from "./app/(student)/take-exam";
import MyResults from "./app/(student)/my-results";
import InstructorDashboard from "./app/(instructor)/dashboard";
import CreateExam from "./app/(instructor)/create-exam";
import ViewResults from "./app/(instructor)/view-results";
import { AuthProvider } from "./app/shared/contexts/AuthContext";
import { ResultsProvider } from "./app/shared/contexts/ResultsContext";
import ExamReview from "./app/(student)/exam-review";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ResultsProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerShown: true,
                headerStyle: {
                  backgroundColor: "#2563eb",
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              }}
            >
              <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={Register}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="StudentDashboard"
                component={StudentDashboard}
                options={{ title: "Student Dashboard", headerLeft: null }}
              />
              <Stack.Screen
                name="ExamReview"
                component={ExamReview}
                options={{ title: "Review Exam", headerBackTitle: "Back" }}
              />
              <Stack.Screen name="TakeExam" component={TakeExam} />
              <Stack.Screen name="MyResults" component={MyResults} />
              <Stack.Screen
                name="InstructorDashboard"
                component={InstructorDashboard}
                options={{ title: "Instructor Dashboard", headerLeft: null }}
              />
              <Stack.Screen name="CreateExam" component={CreateExam} />
              <Stack.Screen name="ViewResults" component={ViewResults} />
            </Stack.Navigator>
          </NavigationContainer>
        </ResultsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
