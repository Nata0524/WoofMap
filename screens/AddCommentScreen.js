// Pantalla para agregar un comentario a un lugar
// Recibe el "place" desde la pantalla anterior
// Guarda el comentario en Firestore y sube foto a Storage

// ------------------------------
// IMPORTS
// ------------------------------
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";

import * as ImagePicker from "expo-image-picker"; // Para seleccionar imagen
import { db, storage } from "../firebaseConfig"; // Firebase
import { getAuth } from "firebase/auth";

import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AddCommentScreen({ route, navigation }) {
  // Recibimos el lugar
  const { place } = route.params;

  // Usuario actual
  const auth = getAuth();
  const user = auth.currentUser;

  // Estados controlados
  const [comment, setComment] = useState("");    // Texto del comentario
  const [image, setImage] = useState(null);      // URI de la imagen seleccionada
  const [loading, setLoading] = useState(false); // Spinner mientras guarda

  // ---------------------------------------
  // Seleccionar imagen desde galería
  // ---------------------------------------
  const pickImage = async () => {
    // Pedir permisos
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Necesitas permiso para acceder a tu galería");
      return;
    }

    // Abrir galería
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    // Si sí escogió una imagen
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // ---------------------------------------
  // Subir imagen a Firebase Storage
  // ---------------------------------------
  const uploadImage = async () => {
    if (!image) return null;

    // Convertir URI a blob
    const blob = await (await fetch(image)).blob();
    const filename = `comments/${user.uid}_${Date.now()}.jpg`;

    const storageRef = ref(storage, filename);

    // Subir archivo
    await uploadBytes(storageRef, blob);

    // Obtener URL pública
    return await getDownloadURL(storageRef);
  };

  // ---------------------------------------
  // Guardar comentario en Firestore
  // ---------------------------------------
  const submitComment = async () => {
    if (!comment.trim() && !image) return; // No permitir vacío

    setLoading(true);

    try {
      // Subir imagen si existe
      const imageUrl = image ? await uploadImage() : null;

      // Guardar en: places -> placeId -> comments
      await addDoc(collection(db, "places", place.id, "comments"), {
        text: comment,
        image: imageUrl,
        userId: user.uid,
        userName: user.displayName || "Usuario",
        userAvatar:
          user.photoURL ||
          "https://cdn-icons-png.flaticon.com/512/847/847969.png",
        createdAt: Timestamp.now(), // Fecha del comentario
      });

      alert("Comentario agregado 🐶💬");
      navigation.goBack(); // Regresar al detalle del lugar
    } catch (error) {
      console.log("ERROR ⛔:", error);
      alert("Ocurrió un error");
    }

    setLoading(false);
  };

  // ---------------------------------------
  // UI
  // ---------------------------------------
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Comentar: {place.name}</Text>

        {/* INPUT DE TEXTO */}
        <TextInput
          placeholder="Escribe tu comentario..."
          value={comment}
          onChangeText={setComment}
          style={styles.input}
          multiline
        />

        {/* BOTÓN PARA ELEGIR IMAGEN */}
        <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
          <Text style={styles.imageBtnText}>
            {image ? "Imagen seleccionada ✅" : "Agregar imagen"}
          </Text>
        </TouchableOpacity>

        {/* PREVIEW */}
        {image && <Image source={{ uri: image }} style={styles.previewImage} />}

        {/* GUARDAR */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={submitComment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Enviar comentario</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ------------------------------
// ESTILOS
// ------------------------------
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    flex: 1,
    padding: 20,
    paddingTop: 25, // Evita que se suba debajo de la hora
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
  },

  input: {
    height: 120,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 15,
  },

  imageBtn: {
    backgroundColor: "#62C170",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  imageBtnText: { color: "#fff", fontWeight: "600" },

  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 15,
  },

  submitBtn: {
    backgroundColor: "#62C170",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  submitText: { color: "#fff", fontWeight: "700" },
});
