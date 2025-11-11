import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { Button, Card, Divider, List, Text } from "react-native-paper";
import { db } from "../../../config/firebaseConfig";
import { useAuth } from "../../../src/auth/AuthContext";

type ClassDoc = {
  name: string;
  teacherId: string;
  startDate?: string;
  endDate?: string;
  recurrence?: "none" | "daily" | "weekly";
};

type Req = {
  id: string;
  studentId: string;
  status: "pending" | "approved" | "rejected";
};

export default function TeacherClassDetail() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const classId = Array.isArray(id) ? id[0] : (id ?? "");
  const { user } = useAuth();

  const [cls, setCls] = useState<ClassDoc | null>(null);
  const [pending, setPending] = useState<Req[]>([]);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const isOwner = useMemo(
    () => Boolean(user && cls && user.uid === cls.teacherId),
    [user, cls]
  );

  const load = useCallback(async () => {
    if (!classId) return;

    // curs
    const docRef = doc(db, "classes", classId);
    const snap = await getDoc(docRef);
    if (snap.exists()) setCls(snap.data() as ClassDoc);

    // cereri pending
    const rq = query(
      collection(db, "enrollRequests"),
      where("classId", "==", classId),
      where("status", "==", "pending")
    );
    const rs = await getDocs(rq);
    setPending(rs.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));

    // înscrieri confirmate
    const eq = query(
      collection(db, "enrollments"),
      where("classId", "==", classId)
    );
    const es = await getDocs(eq);
    setEnrolledCount(es.size);

    // sesiune activă?
    const sq = query(
      collection(db, "sessions"),
      where("classId", "==", classId),
      where("active", "==", true)
    );
    const ss = await getDocs(sq);
    setActiveSessionId(ss.docs[0]?.id ?? null);
  }, [classId]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (reqId: string, studentId: string) => {
    if (!isOwner) return;
    await updateDoc(doc(db, "enrollRequests", reqId), { status: "approved" });
    await addDoc(collection(db, "enrollments"), {
      classId,
      studentId,
      teacherId: user?.uid,
      enrolledAt: serverTimestamp(),
    });
    Alert.alert("OK", "Cererea a fost aprobată.");
    await load(); // reîncarcă datele, fără navigare
  };

  const reject = async (reqId: string) => {
    if (!isOwner) return;
    await updateDoc(doc(db, "enrollRequests", reqId), { status: "rejected" });
    Alert.alert("OK", "Cererea a fost respinsă.");
    await load();
  };

  const startSession = async () => {
    if (!isOwner) return;
    if (activeSessionId) {
      Alert.alert("Info", "Există deja o sesiune activă.");
      return;
    }
    const now = new Date();
    const end = new Date(now.getTime() + 90 * 60 * 1000); // 90 min default
    const docRef = await addDoc(collection(db, "sessions"), {
      classId,
      teacherId: user?.uid,
      startTime: now.toISOString(),
      endTime: end.toISOString(),
      active: true,
      createdAt: serverTimestamp(),
    });
    setActiveSessionId(docRef.id);
    Alert.alert("Pornit", "Sesiunea a început.");
  };

  const stopSession = async () => {
    if (!activeSessionId) return;
    await updateDoc(doc(db, "sessions", activeSessionId), { active: false });
    setActiveSessionId(null);
    Alert.alert("Oprit", "Sesiunea a fost oprită.");
  };

  if (!cls)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Se încarcă...</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Card>
        <Card.Title title={cls.name} subtitle={`Enrolați: ${enrolledCount}`} />
        <Card.Content>
          <Text>Start: {cls.startDate ?? "-"}</Text>
          <Text>End: {cls.endDate ?? "-"}</Text>
          <Text>Recurență: {cls.recurrence ?? "none"}</Text>
        </Card.Content>
      </Card>

      <Card>
        <Card.Title title="Sesiune curentă" />
        <Card.Content style={{ gap: 8 }}>
          <Text>Status: {activeSessionId ? "Activă" : "Inactivă"}</Text>
          {!activeSessionId ? (
            <Button mode="contained" onPress={startSession}>
              Start Class
            </Button>
          ) : (
            <>
              {/* rută relativă către /classes/[id]/report */}
              <Button mode="contained" onPress={() => router.push("./report")}>
                Vezi raport prezențe
              </Button>
              <Button onPress={stopSession}>Oprește sesiunea</Button>
            </>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Title title="Cereri de înscriere (pending)" />
        <Card.Content>
          {pending.length === 0 ? <Text>Nu există cereri.</Text> : null}
          {pending.map((req) => (
            <View key={req.id} style={{ marginVertical: 6 }}>
              <List.Item
                title={`Student: ${req.studentId}`}
                description={`Status: ${req.status}`}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button
                  mode="contained"
                  onPress={() => approve(req.id, req.studentId)}
                >
                  Aprobă
                </Button>
                <Button onPress={() => reject(req.id)}>Respinge</Button>
              </View>
              <Divider style={{ marginVertical: 8 }} />
            </View>
          ))}
        </Card.Content>
      </Card>
    </View>
  );
}
