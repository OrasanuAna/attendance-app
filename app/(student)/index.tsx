import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useAuth } from "../../src/auth/AuthContext";

export default function StudentHome() {
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout(); // delogare din Firebase
      router.replace("/(auth)/sign-in"); // redirect direct la login
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text variant="headlineSmall">Student – Dashboard</Text>

      <Button mode="contained" onPress={() => router.push("./classes")}>
        Vezi cursuri disponibile
      </Button>

      <Button
        mode="outlined"
        onPress={handleLogout}
        loading={loggingOut}
        disabled={loggingOut}
      >
        Delogare
      </Button>
    </View>
  );
}
