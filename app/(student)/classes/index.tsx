import { router } from "expo-router";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { db } from "../../../config/firebaseConfig";
import { useAuth } from "../../../src/auth/AuthContext";

export default function StudentClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [myEnrolls, setMyEnrolls] = useState<string[]>([]);
  const [myPending, setMyPending] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cs = await getDocs(collection(db, "classes"));
      setClasses(cs.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));

      if (user) {
        const eq = query(
          collection(db, "enrollments"),
          where("studentId", "==", user.uid)
        );
        const es = await getDocs(eq);
        setMyEnrolls(es.docs.map((d) => d.data().classId));

        const rq = query(
          collection(db, "enrollRequests"),
          where("studentId", "==", user.uid),
          where("status", "==", "pending")
        );
        const rs = await getDocs(rq);
        setMyPending(rs.docs.map((d) => d.data().classId));
      } else {
        setMyEnrolls([]);
        setMyPending([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const requestEnroll = async (c: any) => {
    if (!user) return;
    // previne dublura
    if (myEnrolls.includes(c.id) || myPending.includes(c.id)) return;

    await addDoc(collection(db, "enrollRequests"), {
      classId: c.id,
      studentId: user.uid,
      teacherId: c.teacherId,
      status: "pending",
      createdAt: Date.now(),
    });

    // actualizează starea locală fără navigare
    setMyPending((prev) => [...prev, c.id]);
    // sau poți reîncărca complet:
    // await load();
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="headlineSmall">Cursuri disponibile</Text>
      <FlatList
        data={classes}
        keyExtractor={(i) => i.id}
        refreshing={loading}
        onRefresh={load}
        renderItem={({ item }) => {
          const enrolled = myEnrolls.includes(item.id);
          const pending = myPending.includes(item.id);
          return (
            <Card
              style={{ marginVertical: 6 }}
              // IMPORTANT: rută RELATIVĂ (suntem deja în /classes)
              onPress={() => router.push(`./${item.id}`)}
            >
              <Card.Title title={item.name} />
              <Card.Content>
                <Text>Profesor: {item.teacherId}</Text>
                <Text>Start: {item.startDate ?? "-"}</Text>
                <Text>End: {item.endDate ?? "-"}</Text>
                <Text>Recurență: {item.recurrence ?? "none"}</Text>
                {enrolled ? (
                  <Button disabled style={{ marginTop: 6 }}>
                    Înscris(ă)
                  </Button>
                ) : pending ? (
                  <Button disabled style={{ marginTop: 6 }}>
                    În așteptare
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    onPress={() => requestEnroll(item)}
                    style={{ marginTop: 6 }}
                  >
                    Cere înscriere
                  </Button>
                )}
              </Card.Content>
            </Card>
          );
        }}
      />
    </View>
  );
}
