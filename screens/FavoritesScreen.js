// Importaciones de React y hooks
import React, { useEffect, useState } from "react";

// Componentes de React Native
import {
  View,
  Text,
  StyleSheet,
  FlatList, // Lista optimizada
  Image,
  TouchableOpacity,
  SafeAreaView, // Para respetar notch/status bar
} from "react-native";

// Iconos de Expo
import { Ionicons } from "@expo/vector-icons";

// Firebase Firestore
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// ==============================
// Componente principal FavoritesScreen
// ==============================
export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]); // Estado para guardar favoritos
  const USER_ID = "PbQyEh3VxiIPzKR43orO"; // ID de usuario fijo (reemplazar por Auth real)

  // ==============================
  // Cargar favoritos desde Firestore
  // ==============================
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        // Referencia a subcolección 'favorites' del usuario
        const ref = collection(db, "users", USER_ID, "favorites");
        const snapshot = await getDocs(ref);

        // Mapear documentos a array
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFavorites(data);
      } catch (error) {
        console.log("Error cargando favoritos:", error);
      }
    };

    loadFavorites();
  }, []);

  // ==============================
  // Estado vacío: mostrar mensaje si no hay favoritos
  // ==============================
  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.emptyState}>
        <Ionicons name="heart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>Aún no tienes favoritos</Text>
        <Text style={styles.emptySubtext}>
          Ve a un lugar y presiona el corazón 💚
        </Text>
      </SafeAreaView>
    );
  }

  // ==============================
  // Renderizado principal
  // ==============================
  return (
    <SafeAreaView style={styles.container}>
      {/* TÍTULO */}
      <Text style={styles.title}>Mis favoritos</Text>

      {/* LISTA DE FAVORITOS */}
      <FlatList
        data={favorites}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("PlaceDetails", { place: item })} // Navegar a detalles del lugar
          >
            {/* Imagen del lugar */}
            <Image source={{ uri: item.image }} style={styles.image} />

            {/* Información del lugar */}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.category}>{item.category}</Text>

              {/* Rating */}
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={18} color="#FFD700" />
                <Text style={styles.rating}>{item.rating}</Text>
              </View>
            </View>

            {/* Flecha de navegación */}
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

// ========================
// ESTILOS
// ========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    marginTop: 10,
    color: "#333",
  },

  // Estado vacío
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  emptyText: {
    fontSize: 22,
    marginTop: 15,
    color: "#444",
    fontWeight: "600",
  },

  emptySubtext: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
    textAlign: "center",
    width: "75%",
  },

  // Tarjeta de cada lugar favorito
  card: {
    backgroundColor: "#fff",
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
  },

  category: {
    fontSize: 13,
    color: "#62C170",
    marginTop: 4,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
  },
});
