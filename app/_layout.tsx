import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider } from "../src/auth/AuthContext";

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </PaperProvider>
  );
}
