import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useAuth } from "../../src/auth/AuthContext";

export default function StudentHome() {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text variant="headlineSmall">Student – Dashboard</Text>
      <Button mode="contained">Vezi cursuri disponibile</Button>
      <Button onPress={logout}>Delogare</Button>
    </View>
  );
}
