import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/auth/AuthContext";

export default function Index() {
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/(auth)/sign-in");
      return;
    }

    if (role === "teacher") router.replace("/(teacher)");
    else if (role === "student") router.replace("/(student)");
    else router.replace("/(auth)/sign-in");
  }, [user, role, loading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
