import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebaseConfig";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

export default function PlaceDetailsScreen({ route, navigation }) {
  const place = route.params.place;

  // 👉 User real
  const USER_ID = "PbQyEh3VxiIPzKR43orO";

  const [isFavorite, setIsFavorite] = useState(false);

  // 👉 Revisar si YA está en favoritos
  useEffect(() => {
    const checkFavorite = async () => {
      const ref = doc(db, "users", USER_ID, "favorites", place.id);
      const snapshot = await getDoc(ref);

      if (snapshot.exists()) {
        setIsFavorite(true);
      }
    };

    checkFavorite();
  }, []);

  // 👉 Abrir Google Maps
  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
    Linking.openURL(url);
  };

  // 👉 Agregar a favoritos
  const addToFavorites = async () => {
    try {
      await setDoc(doc(db, "users", USER_ID, "favorites", place.id), place);
      setIsFavorite(true);
      alert("Añadido a favoritos 💚🐾");
    } catch (error) {
      console.log("Error añadiendo favorito:", error);
    }
  };

  // 👉 Quitar de favoritos
  const removeFavorite = async () => {
    try {
      await deleteDoc(doc(db, "users", USER_ID, "favorites", place.id));
      setIsFavorite(false);
      alert("Eliminado de favoritos 💔🐾");
    } catch (error) {
      console.log("Error eliminando favorito:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* FOTO PRINCIPAL */}
      <Image source={{ uri: place.image }} style={styles.headerImage} />

      {/* BOTÓN VOLVER */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* CONTENIDO */}
      <View style={styles.content}>
        <Text style={styles.title}>{place.name}</Text>
        <Text style={styles.category}>{place.category}</Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.ratingText}>{place.rating}</Text>
        </View>

        {/* DESCRIPCIÓN */}
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>
          Lugar pet-friendly ideal para visitar con tu mascota.
        </Text>

        {/* UBICACIÓN */}
        <Text style={styles.sectionTitle}>Ubicación</Text>
        <Text style={styles.description}>
          Lat: {place.lat}
          {"\n"}
          Lng: {place.lng}
        </Text>

        {/* BOTÓN MAPA */}
        <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
          <Ionicons name="map" size={20} color="#fff" />
          <Text style={styles.mapButtonText}>Ver en mapa</Text>
        </TouchableOpacity>

        {/* FAVORITOS (ADD / REMOVE) */}
        {!isFavorite ? (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={addToFavorites}
          >
            <Ionicons name="heart-outline" size={22} color="#62C170" />
            <Text style={styles.favoriteText}>Añadir a favoritos</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={removeFavorite}
          >
            <Ionicons name="heart-dislike" size={22} color="#fff" />
            <Text style={styles.removeText}>Quitar de favoritos</Text>
          </TouchableOpacity>
        )}

        {/* COMENTARIOS */}
        <TouchableOpacity
          style={styles.commentButton}
          onPress={() => navigation.navigate("AddComment", { place })}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color="#fff"
          />
          <Text style={styles.commentButtonText}>Agregar comentario</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ------------------------ ESTILOS ------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerImage: {
    width: "100%",
    height: 260,
  },

  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 30,
  },

  content: { padding: 20 },

  title: { fontSize: 28, fontWeight: "700" },

  category: {
    fontSize: 16,
    color: "#62C170",
    marginTop: 4,
  },

  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },

  ratingText: { marginLeft: 5, fontSize: 18 },

  sectionTitle: { marginTop: 20, fontSize: 18, fontWeight: "600" },

  description: {
    marginTop: 8,
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },

  mapButton: {
    marginTop: 25,
    backgroundColor: "#62C170",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
  },

  mapButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  favoriteButton: {
    marginTop: 15,
    borderWidth: 2,
    borderColor: "#62C170",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
  },

  favoriteText: {
    color: "#62C170",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  removeButton: {
    marginTop: 15,
    backgroundColor: "#ff6961",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
  },

  removeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  commentButton: {
    marginTop: 15,
    backgroundColor: "#62C170",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
  },

  commentButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});
