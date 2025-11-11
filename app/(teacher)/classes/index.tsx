import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { db } from "../../../config/firebaseConfig";
import { useAuth } from "../../../src/auth/AuthContext";

type ClassItem = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  recurrence?: string;
};

export default function TeacherClasses() {
  const { user } = useAuth();
  const [items, setItems] = useState<ClassItem[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const q = query(collection(db, "classes"), where("teacherId", "==", user.uid));
      const snap = await getDocs(q);
      const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setItems(rows);
    };
    load();
  }, [user]);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text variant="headlineSmall">Cursurile mele</Text>
      <Button mode="contained" onPress={() => router.push("/(teacher)/classes/new")}>
        Adaugă curs
      </Button>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Card style={{ marginVertical: 6 }} onPress={() => router.push(`/(teacher)/classes/${item.id}`)}>
            <Card.Title title={item.name} />
            <Card.Content>
              <Text>Start: {item.startDate ?? "-"}</Text>
              <Text>End: {item.endDate ?? "-"}</Text>
              <Text>Recurență: {item.recurrence ?? "none"}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}
