// Importaciones de React y hooks
import React, { useState, useEffect } from "react";

// Componentes de React Native
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Share,
} from "react-native";

// Iconos de Expo
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Firebase Firestore
import { db } from "../firebaseConfig";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

// Firebase Auth
import { getAuth } from "firebase/auth";

// ==============================
// Componente principal EventDetails
// ==============================
export default function EventDetails({ route, navigation }) {
  // Recibimos el evento como parámetro
  const { event } = route.params;

  // Estado para saber si el evento está en favoritos
  const [isFavorite, setIsFavorite] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser; // Usuario actual

  // ==============================
  // Revisar si el evento ya está en favoritos
  // ==============================
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return;
      const favRef = doc(db, "users", user.uid, "favorites", event.id);
      const favSnap = await getDoc(favRef);
      setIsFavorite(favSnap.exists()); // True si existe en Firestore
    };
    checkFavorite();
  }, []);

  // ==============================
  // Función para alternar favorito
  // ==============================
  const toggleFavorite = async () => {
    if (!user) {
      alert("Debes iniciar sesión para usar favoritos");
      return;
    }
    const favRef = doc(db, "users", user.uid, "favorites", event.id);
    if (isFavorite) {
      await deleteDoc(favRef); // Si ya es favorito, eliminar
      setIsFavorite(false);
    } else {
      await setDoc(favRef, event); // Si no, agregar
      setIsFavorite(true);
    }
  };

  // ==============================
  // Compartir evento
  // ==============================
  const shareEvent = async () => {
    try {
      await Share.share({
        message: `${event.name} el ${event.date} en ${event.location}. Más info en WoofMap!`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // ==============================
  // Abrir HomeScreen centrando el mapa en la ubicación del evento
  // ==============================
  const goToMap = () => {
    navigation.navigate("HomeTabs", {
      screen: "Home",
      params: {
        centerLocation: { lat: event.lat, lng: event.lng, placeId: event.id },
      },
    });
  };

  // ==============================
  // Renderizado del componente
  // ==============================
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Imagen del evento */}
      <Image source={{ uri: event.image }} style={styles.banner} />

      <View style={styles.content}>
        {/* Nombre del evento */}
        <Text style={styles.title}>{event.name}</Text>

        {/* Fecha */}
        <View style={styles.row}>
          <Ionicons name="calendar" size={20} color="#62C170" />
          <Text style={styles.text}>{event.date}</Text>
        </View>

        {/* Ubicación */}
        <View style={styles.row}>
          <Ionicons name="location" size={20} color="#62C170" />
          <Text style={styles.text}>{event.location}</Text>
        </View>

        {/* Pet-Friendly */}
        <View style={styles.row}>
          <MaterialIcons name="pets" size={20} color="#62C170" />
          <Text style={styles.text}>Pet-Friendly</Text>
        </View>

        {/* Descripción */}
        <Text style={styles.description}>{event.description}</Text>

        {/* BOTONES FAVORITO Y COMPARTIR */}
        <View style={styles.buttonsRow}>
          {/* Favorito */}
          <TouchableOpacity style={styles.favBtn} onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color="#fff"
            />
            <Text style={styles.btnText}>Favorito</Text>
          </TouchableOpacity>

          {/* Compartir */}
          <TouchableOpacity style={styles.shareBtn} onPress={shareEvent}>
            <Ionicons name="share-social-outline" size={22} color="#62C170" />
            <Text style={styles.btnTextShare}>Compartir</Text>
          </TouchableOpacity>
        </View>

        {/* BOTÓN VER EN MAPA */}
        <TouchableOpacity style={styles.mapBtn} onPress={goToMap}>
          <Text style={styles.mapBtnText}>Ver en mapa</Text>
        </TouchableOpacity>

        {/* BOTÓN VOLVER */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Volver a eventos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ========================
// ESTILOS
// ========================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" }, // Contenedor principal
  banner: { width: "100%", height: 250 }, // Imagen superior del evento
  content: { padding: 20 }, // Contenido principal
  title: { fontSize: 22, fontWeight: "700", color: "#333", marginBottom: 15 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 }, // Fila de icono + texto
  text: { marginLeft: 8, fontSize: 16, color: "#555" },
  description: { marginTop: 15, fontSize: 16, color: "#555", lineHeight: 22 },
  buttonsRow: { flexDirection: "row", marginTop: 25, justifyContent: "space-between" },
  favBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#62C170", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12 },
  shareBtn: { flexDirection: "row", alignItems: "center", borderColor: "#62C170", borderWidth: 1, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12 },
  btnText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
  btnTextShare: { color: "#62C170", marginLeft: 8, fontWeight: "600" },
  mapBtn: { marginTop: 20, backgroundColor: "#62C170", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  mapBtnText: { color: "#fff", fontWeight: "600" },
  backBtn: { marginTop: 30, alignItems: "center" },
  backText: { color: "#62C170", fontSize: 16, fontWeight: "600" },
});
