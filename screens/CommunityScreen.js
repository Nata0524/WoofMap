// Importaciones de React y hooks
import React, { useState, useEffect } from "react";

// Componentes y utilidades de React Native
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, TouchableWithoutFeedback,
  Keyboard, KeyboardAvoidingView, Platform
} from "react-native";

// Iconos de Expo
import { Ionicons } from "@expo/vector-icons";

// Para seleccionar imágenes desde la galería
import * as ImagePicker from "expo-image-picker";

// Firebase Firestore
import { db } from "../firebaseConfig";
import {
  collection, addDoc, getDocs, updateDoc, doc, serverTimestamp
} from "firebase/firestore";

// Firebase Auth
import { getAuth } from "firebase/auth";

// ==============================
// Componente principal CommunityScreen
// ==============================
export default function CommunityScreen({ navigation }) {
  // -------------------
  // Estados
  // -------------------
  const [posts, setPosts] = useState([]);          // Lista de posts
  const [modalVisible, setModalVisible] = useState(false); // Controla modal de nuevo post
  const [newPostContent, setNewPostContent] = useState(""); // Texto del nuevo post
  const [newPostImage, setNewPostImage] = useState(null);   // Imagen del nuevo post
  const [loading, setLoading] = useState(false);   // Indicador de carga al publicar

  const auth = getAuth();
  const user = auth.currentUser;                  // Usuario actual
  const [userData, setUserData] = useState(null); // Datos del usuario (nombre, avatar)

  // ========================
  // Cargar datos de usuario
  // ========================
  const loadUserData = async () => {
    if (!user) return;
    try {
      const snap = await getDocs(collection(db, "users"));
      // Buscamos los datos del usuario actual por su uid
      const data = snap.docs.find((d) => d.id === user.uid)?.data();
      setUserData(data);
    } catch (error) {
      console.log("Error cargando usuario:", error);
    }
  };

  // Cargar datos de usuario al montar el componente
  useEffect(() => {
    loadUserData();
  }, []);

  // ========================
  // Cargar posts desde Firestore
  // ========================
  const loadPosts = async () => {
    try {
      const snap = await getDocs(collection(db, "posts"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Ordenar posts por fecha, más recientes primero
      data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setPosts(data);
    } catch (error) {
      console.log("Error cargando posts:", error);
    }
  };

  // Cargar posts al montar el componente
  useEffect(() => {
    loadPosts();
  }, []);

  // ========================
  // Función para dar like
  // ========================
  const addLike = async (postId, currentLikes) => {
    try {
      await updateDoc(doc(db, "posts", postId), {
        likes: currentLikes + 1,
      });
      loadPosts(); // Recargar posts para reflejar cambios
    } catch (error) {
      console.log("Error dando like:", error);
    }
  };

  // ========================
  // Función para seleccionar imagen
  // ========================
  const pickImage = async () => {
    Keyboard.dismiss(); // Cerrar teclado si está abierto
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setNewPostImage(result.assets[0].uri);
  };

  // ========================
  // Crear nuevo post
  // ========================
  const addPost = async () => {
    if (!newPostContent.trim() && !newPostImage) return; // No permitir post vacío
    setLoading(true);

    try {
      await addDoc(collection(db, "posts"), {
        userName: userData?.name || "Usuario",
        userAvatar: userData?.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png",
        content: newPostContent,
        image: newPostImage || null,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      });

      // Limpiar formulario
      setNewPostContent("");
      setNewPostImage(null);
      setModalVisible(false);
      loadPosts(); // Recargar posts
    } catch (error) {
      console.log("Error publicando:", error);
    }

    setLoading(false);
  };

  // ========================
  // Renderizado
  // ========================
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comunidad Pet Lovers</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {posts.map((post) => (
          <View key={post.id} style={styles.card}>
            {/* Usuario y avatar */}
            <View style={styles.row}>
              <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
              <Text style={styles.user}>{post.userName}</Text>
            </View>

            {/* Contenido del post */}
            <Text style={styles.content}>{post.content}</Text>

            {/* Imagen del post */}
            {post.image && (
              <Image source={{ uri: post.image }} style={styles.postImage} />
            )}

            {/* Acciones: Like y Comentarios */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.action}
                onPress={() => addLike(post.id, post.likes)}
              >
                <Ionicons name="heart-outline" size={20} color="#62C170" />
                <Text style={styles.actionText}>{post.likes}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.action}
                onPress={() =>
                  navigation.navigate("PostComments", { postId: post.id })
                }
              >
                <Ionicons name="chatbubble-outline" size={20} color="#62C170" />
                <Text style={styles.actionText}>{post.comments}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Botón flotante para crear nuevo post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* ================= MODAL NUEVO POST ================= */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1, justifyContent: "flex-end" }}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Nuevo Post</Text>

                {/* Input de texto */}
                <TextInput
                  placeholder="Escribe algo..."
                  value={newPostContent}
                  onChangeText={setNewPostContent}
                  style={styles.input}
                  multiline
                />

                {/* Botón seleccionar imagen */}
                <TouchableOpacity
                  style={styles.imagePickerBtn}
                  onPress={pickImage}
                >
                  <Text style={styles.imagePickerText}>
                    {newPostImage ? "Imagen seleccionada ✔" : "Agregar imagen"}
                  </Text>
                </TouchableOpacity>

                {/* Previsualización imagen */}
                {newPostImage && (
                  <Image source={{ uri: newPostImage }} style={styles.previewImage} />
                )}

                {/* Botones publicar / cancelar */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalBtn} onPress={addPost}>
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.modalBtnText}>Publicar</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={{ color: "#333", fontWeight: "700" }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// ========================
// ESTILOS
// ========================
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20, color: "#333" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 20,
    padding: 15,
    elevation: 2, // sombra en Android
  },

  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  user: { marginLeft: 10, fontWeight: "700", fontSize: 16 },

  content: { fontSize: 15, color: "#555", marginBottom: 10 },
  postImage: { width: "100%", height: 200, borderRadius: 12, marginBottom: 10 },

  actionsRow: { flexDirection: "row", marginTop: 5 },
  action: { flexDirection: "row", alignItems: "center", marginRight: 20 },
  actionText: { marginLeft: 6, color: "#555", fontWeight: "600" },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#62C170",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  modalContainer: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },

  modalContent: { backgroundColor: "#fff", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },

  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 15 },

  input: { height: 100, borderColor: "#ccc", borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 12, textAlignVertical: "top" },

  imagePickerBtn: { backgroundColor: "#62C170", padding: 12, borderRadius: 12, alignItems: "center" },

  imagePickerText: { color: "#fff", fontWeight: "700" },

  previewImage: { width: "100%", height: 150, borderRadius: 12, marginTop: 10 },

  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },

  modalBtn: { backgroundColor: "#62C170", padding: 12, borderRadius: 12, width: "48%", alignItems: "center" },

  modalBtnText: { color: "#fff", fontWeight: "700" },
});
