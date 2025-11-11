import { router } from "expo-router";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { db } from "../../../config/firebaseConfig";
import { useAuth } from "../../../src/auth/AuthContext";

export default function StudentClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [myEnrolls, setMyEnrolls] = useState<string[]>([]);
  const [myPending, setMyPending] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const cs = await getDocs(collection(db, "classes"));
      setClasses(cs.docs.map(d => ({ id: d.id, ...(d.data() as any) })));

      if (user) {
        const eq = query(collection(db, "enrollments"), where("studentId", "==", user.uid));
        const es = await getDocs(eq);
        setMyEnrolls(es.docs.map(d => d.data().classId));

        const rq = query(collection(db, "enrollRequests"), where("studentId", "==", user.uid), where("status", "==", "pending"));
        const rs = await getDocs(rq);
        setMyPending(rs.docs.map(d => d.data().classId));
      }
    };
    load();
  }, [user]);

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
    router.replace("/(student)/classes"); // refresh simplu
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="headlineSmall">Cursuri disponibile</Text>
      <FlatList
        data={classes}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const enrolled = myEnrolls.includes(item.id);
          const pending = myPending.includes(item.id);
          return (
            <Card style={{ marginVertical: 6 }} onPress={() => router.push(`/(student)/classes/${item.id}`)}>
              <Card.Title title={item.name} />
              <Card.Content>
                <Text>Profesor: {item.teacherId}</Text>
                <Text>Start: {item.startDate ?? "-"}</Text>
                <Text>End: {item.endDate ?? "-"}</Text>
                <Text>Recurență: {item.recurrence ?? "none"}</Text>
                {enrolled ? (
                  <Button disabled>Înscris(ă)</Button>
                ) : pending ? (
                  <Button disabled>În așteptare</Button>
                ) : (
                  <Button mode="contained" onPress={() => requestEnroll(item)}>Cere înscriere</Button>
                )}
              </Card.Content>
            </Card>
          );
        }}
      />
    </View>
  );
}
