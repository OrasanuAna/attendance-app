import { router } from "expo-router";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useAuth } from "../../src/auth/AuthContext";

export default function TeacherHome() {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text variant="headlineSmall">Profesor – Dashboard</Text>
      <Button mode="contained" onPress={() => router.push("/(teacher)/classes")}>
        Cursurile mele
      </Button>
      <Button onPress={logout}>Delogare</Button>
    </View>
  );
}
