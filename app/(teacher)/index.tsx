import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useAuth } from "../../src/auth/AuthContext";

export default function TeacherHome() {
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();            // semnează ieșirea din Firebase
      router.replace("/");       // trimite la gatekeeper (care duce la /(auth)/sign-in)
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text variant="headlineSmall">Profesor – Dashboard</Text>

      <Button mode="contained" onPress={() => router.push("./classes")}>
        Cursurile mele
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
