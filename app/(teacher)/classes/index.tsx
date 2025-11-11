import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "classes"), where("teacherId", "==", user.uid));
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setItems(rows);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text variant="headlineSmall">Cursurile mele</Text>

      {/* Rută RELATIVĂ către /classes/new */}
      <Button mode="contained" onPress={() => router.push("./new")}>
        Adaugă curs
      </Button>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={
          !loading ? <Text style={{ marginTop: 12 }}>Nu ai încă niciun curs.</Text> : null
        }
        renderItem={({ item }) => (
          <Card
            style={{ marginVertical: 6 }}
            // Rută RELATIVĂ către /classes/[id]
            onPress={() => router.push(`./${item.id}`)}
          >
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
