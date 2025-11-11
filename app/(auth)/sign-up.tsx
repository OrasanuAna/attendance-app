import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { View } from "react-native";
import { Button, RadioButton, Text, TextInput } from "react-native-paper";
import { auth, db } from "../../config/firebaseConfig";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("student");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onRegister = async () => {
    setErr("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: email.trim(),
        displayName: name,
        role,
        createdAt: Date.now(),
      });
      router.replace("/");
    } catch (e: any) {
      setErr(e?.message ?? "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 16 }}>
      <Text variant="headlineSmall">Creează cont</Text>
      <TextInput label="Nume" value={name} onChangeText={setName} />
      <TextInput label="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput label="Parolă" secureTextEntry value={password} onChangeText={setPassword} />

      <Text variant="titleSmall" style={{ marginTop: 8 }}>Rol</Text>
      <RadioButton.Group onValueChange={(v) => setRole(v as any)} value={role}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <RadioButton value="student" /><Text>Student</Text>
          <RadioButton value="teacher" /><Text>Profesor</Text>
        </View>
      </RadioButton.Group>

      {err ? <Text style={{ color: "red" }}>{err}</Text> : null}

      <Button mode="contained" onPress={onRegister} loading={loading}>
        Creează cont
      </Button>

      <Text>
        Ai deja cont? <Link href="/(auth)/sign-in">Autentifică-te</Link>
      </Text>
    </View>
  );
}
