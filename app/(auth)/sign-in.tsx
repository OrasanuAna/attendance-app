import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { auth } from "../../config/firebaseConfig";
import { useAuth } from "../../src/auth/AuthContext";

export default function SignIn() {
  const { role } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onLogin = async () => {
    setErr("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 16 }}>
      <Text variant="headlineSmall">Autentificare</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput label="Parolă" value={password} onChangeText={setPassword} secureTextEntry />
      {err ? <Text style={{ color: "red" }}>{err}</Text> : null}
      <Button mode="contained" onPress={onLogin} loading={loading}>
        Intră în cont
      </Button>
      <Text>
        Nu ai cont? <Link href="/(auth)/sign-up">Crează-ți cont</Link>
      </Text>
    </View>
  );
}
