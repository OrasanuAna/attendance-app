import { useLocalSearchParams } from "expo-router";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Card, Text } from "react-native-paper";
import { db } from "../../../../config/firebaseConfig";

export default function ClassReport() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [presentCount, setPresentCount] = useState(0);
  const [totalEnrolled, setTotalEnrolled] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      // ultima sesiune după startTime desc
      const sq = query(collection(db, "sessions"), where("classId", "==", id), orderBy("startTime", "desc"));
      const ss = await getDocs(sq);
      const lastSessionId = ss.docs[0]?.id;
      if (!lastSessionId) return;

      // prezențe pentru sesiunea asta
      const aq = query(collection(db, "attendance"), where("sessionId", "==", lastSessionId));
      const as = await getDocs(aq);
      setPresentCount(as.size);

      // total înscriși la curs
      const eq = query(collection(db, "enrollments"), where("classId", "==", id));
      const es = await getDocs(eq);
      setTotalEnrolled(es.size);
    };
    load();
  }, [id]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Card>
        <Card.Title title="Raport prezențe (ultima sesiune)" />
        <Card.Content style={{ gap: 8 }}>
          <Text>Prezenți: {presentCount}</Text>
          <Text>Înscriși total: {totalEnrolled}</Text>
        </Card.Content>
      </Card>
    </View>
  );
}
