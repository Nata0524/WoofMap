import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function PostCommentsScreen({ route }) {
  const { postId } = route.params;

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  // =========================
  // Cargar comentarios
  // =========================
  const loadComments = async () => {
    try {
      const snap = await getDocs(
        collection(db, "posts", postId, "comments")
      );

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setComments(data);
    } catch (error) {
      console.log("Error cargando comentarios:", error);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  // =========================
  // Enviar comentario
  // =========================
  const sendComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);

    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        userId: user.uid,
        text: newComment,
        createdAt: serverTimestamp(),
      });

      // Actualizar contador en el post
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        comments: comments.length + 1,
      });

      setNewComment(""); // limpiar input
      loadComments(); // recargar lista

    } catch (error) {
      console.log("Error enviando comentario:", error);
    }

    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>

        {/* TÍTULO */}
        <Text style={styles.title}>Comentarios</Text>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView style={styles.commentsList}>
            {comments.map((c) => (
              <View key={c.id} style={styles.commentItem}>
                <Ionicons name="person-circle" size={32} color="#62C170" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.commentText}>{c.text}</Text>
                  <Text style={styles.smallDate}>Hace un momento</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* INPUT PARA COMENTAR */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Escribe un comentario..."
              value={newComment}
              onChangeText={setNewComment}
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendComment}
              disabled={loading}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

// =========================
// ESTILOS
// =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // 🔥 Bajé el título
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },

  commentsList: {
    flex: 1,
    marginBottom: 10,
  },

  commentItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  commentText: { fontSize: 16, color: "#333", maxWidth: "85%" },
  smallDate: { fontSize: 12, color: "#888" },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 20,
    backgroundColor: "#f9f9f9",
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: "#62C170",
    padding: 12,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
