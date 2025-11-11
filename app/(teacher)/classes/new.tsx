import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Button, Card, RadioButton, Text, TextInput } from "react-native-paper";
import { db } from "../../../config/firebaseConfig";
import { useAuth } from "../../../src/auth/AuthContext";

type Recurrence = "none" | "daily" | "weekly";

export default function NewClass() {
  const { user, role } = useAuth();
  const [name, setName] = useState("");
  const [start, setStart] = useState(""); // ex: 2025-11-12T09:00
  const [end, setEnd] = useState("");     // ex: 2025-11-12T10:30
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [loading, setLoading] = useState(false);
  const isTeacher = role === "teacher";

  const validate = () => {
    if (!isTeacher) {
      Alert.alert("Acces refuzat", "Doar profesorii pot crea cursuri.");
      return false;
    }
    if (!name.trim()) {
      Alert.alert("Validare", "Te rog completează numele cursului.");
      return false;
    }
    if (!start || !end) {
      Alert.alert("Validare", "Completează datele de început și sfârșit.");
      return false;
    }
    const dStart = new Date(start);
    const dEnd = new Date(end);
    if (isNaN(dStart.getTime()) || isNaN(dEnd.getTime())) {
      Alert.alert("Validare", "Formatele de dată sunt invalide. Exemplu: 2025-11-12T09:00");
      return false;
    }
    if (dEnd <= dStart) {
      Alert.alert("Validare", "Data de sfârșit trebuie să fie după data de început.");
      return false;
    }
    return true;
  };

  const onSave = async () => {
    if (!user) return;
    if (!validate()) return;

    try {
      setLoading(true);
      await addDoc(collection(db, "classes"), {
        name: name.trim(),
        teacherId: user.uid,
        startDate: new Date(start).toISOString(),
        endDate: new Date(end).toISOString(),
        recurrence,             // "none" | "daily" | "weekly"
        createdAt: serverTimestamp(),
      });
      Alert.alert("Succes", "Cursul a fost creat.");
      router.replace("/(teacher)");
    } catch (e: any) {
      Alert.alert("Eroare", e?.message ?? "Nu s-a putut crea cursul.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card>
        <Card.Title title="Adaugă curs" />
        <Card.Content style={{ gap: 12 }}>
          <TextInput
            label="Nume curs"
            value={name}
            onChangeText={setName}
          />
          <Text variant="titleSmall">Data început</Text>
          <TextInput
            placeholder="Ex: 2025-11-12T09:00"
            value={start}
            onChangeText={setStart}
            autoCapitalize="none"
          />
          <Text variant="titleSmall">Data sfârșit</Text>
          <TextInput
            placeholder="Ex: 2025-11-12T10:30"
            value={end}
            onChangeText={setEnd}
            autoCapitalize="none"
          />

          <Text variant="titleSmall" style={{ marginTop: 8 }}>Recurență</Text>
          <RadioButton.Group onValueChange={(v) => setRecurrence(v as Recurrence)} value={recurrence}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <RadioButton value="none" /><Text>Fără</Text>
              <RadioButton value="daily" /><Text>Zilnic</Text>
              <RadioButton value="weekly" /><Text>Săptămânal</Text>
            </View>
          </RadioButton.Group>

          <Button mode="contained" onPress={onSave} loading={loading} disabled={loading}>
            Salvează cursul
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
