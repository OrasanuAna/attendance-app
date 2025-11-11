import { useLocalSearchParams } from "expo-router";
import {
    addDoc, collection, doc, getDoc, getDocs, query, where
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { db } from "../../../config/firebaseConfig";
import { useAuth } from "../../../src/auth/AuthContext";

export default function StudentClassDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [cls, setCls] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [alreadyPresent, setAlreadyPresent] = useState(false);

  const canAttend = useMemo(() => enrolled && !!activeSession, [enrolled, activeSession]);

  useEffect(() => {
    const load = async () => {
      if (!id || !user) return;

      const cs = await getDoc(doc(db, "classes", String(id)));
      if (cs.exists()) setCls(cs.data());

      const eq = query(collection(db, "enrollments"), where("classId", "==", id), where("studentId", "==", user.uid));
      const es = await getDocs(eq);
      setEnrolled(es.size > 0);

      const sq = query(collection(db, "sessions"), where("classId", "==", id), where("active", "==", true));
      const ss = await getDocs(sq);
      const sId = ss.docs[0]?.id ?? null;
      setActiveSession(sId);

      if (sId) {
        const aq = query(collection(db, "attendance"), where("sessionId", "==", sId), where("studentId", "==", user.uid));
        const as = await getDocs(aq);
        setAlreadyPresent(as.size > 0);
      }
    };
    load();
  }, [id, user]);

  const markPresent = async () => {
    if (!user || !activeSession) return;
    if (!enrolled) { Alert.alert("Info", "Nu ești înscris(ă) la acest curs."); return; }
    if (alreadyPresent) { Alert.alert("Info", "Ești deja marcat(ă) prezent(ă)."); return; }
    await addDoc(collection(db, "attendance"), {
      sessionId: activeSession,
      classId: id,
      studentId: user.uid,
      status: "present",
      markedAt: new Date().toISOString(),
    });
    Alert.alert("Succes", "Prezența a fost înregistrată.");
    setAlreadyPresent(true);
  };

  if (!cls) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><Text>Se încarcă...</Text></View>;

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Card>
        <Card.Title title={cls.name} />
        <Card.Content>
          <Text>Start: {cls.startDate ?? "-"}</Text>
          <Text>End: {cls.endDate ?? "-"}</Text>
          <Text>Recurență: {cls.recurrence ?? "none"}</Text>
          <Text>Înscris(ă): {enrolled ? "Da" : "Nu"}</Text>
          <Text>Sesiune activă: {activeSession ? "Da" : "Nu"}</Text>
        </Card.Content>
      </Card>

      {canAttend ? (
        <Button mode="contained" onPress={markPresent} disabled={alreadyPresent}>
          {alreadyPresent ? "Prezent(ă) marcat(ă)" : "Dă prezent"}
        </Button>
      ) : (
        <Text style={{ opacity: 0.7 }}>Poți da prezent doar dacă ești înscris(ă) și există o sesiune activă.</Text>
      )}
    </View>
  );
}
