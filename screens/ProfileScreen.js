import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function ProfileScreen({ navigation }) {
  const auth = getAuth();
  const userFB = auth.currentUser;

  const [userData, setUserData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isEnglish, setIsEnglish] = useState(false);

  // =============================
  // 🔥 Cargar datos del usuario
  // =============================
  useEffect(() => {
    if (!userFB) return;

    const loadUser = async () => {
      try {
        const ref = doc(db, "users", userFB.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUserData(snap.data());
        }
      } catch (error) {
        console.log("Error cargando usuario:", error);
      }
    };

    loadUser();
  }, []);

  // =============================
  // 🔥 Cargar favoritos
  // =============================
  useEffect(() => {
    if (!userFB) return;

    const loadFavorites = async () => {
      try {
        const ref = collection(db, "users", userFB.uid, "favorites");
        const snap = await getDocs(ref);

        let favs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // ordenar y dejar solo 3
        favs = favs.reverse();

        setFavorites(favs.slice(0, 3));
      } catch (error) {
        console.log("Error cargando favoritos:", error);
      }
    };

    loadFavorites();
  }, []);

  // =============================
  // 🔥 Logout
  // =============================
  const logout = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login");
    } catch (error) {
      console.log("Error cerrando sesión:", error);
    }
  };

  // =============================
  // Pantalla cargando
  // =============================
  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#62C170" />
        <Text style={{ marginTop: 10 }}>Cargando perfil...</Text>
      </View>
    );
  }

  // =============================
  // Pantalla principal
  // =============================
  return (
    <View style={styles.container}>

      {/* Avatar */}
      <Image source={{ uri: userData.avatar }} style={styles.avatar} />

      <Text style={styles.name}>{userData.name}</Text>
      <Text style={styles.petName}>Mascota: {userData.petName}</Text>
      <Text style={styles.email}>{userFB.email}</Text>

      {/* FAVORITOS */}
      <Text style={styles.sectionTitle}>Tus últimos favoritos 💚</Text>

      {favorites.length === 0 ? (
        <Text style={styles.noFavs}>Aún no tienes favoritos</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.favoriteCard}
              onPress={() => navigation.navigate("PlaceDetails", { place: item })}
            >
              <Image source={{ uri: item.image }} style={styles.favoriteImage} />

              <View style={{ marginLeft: 12 }}>
                <Text style={styles.favoriteName}>{item.name}</Text>
                <Text style={styles.favoriteCategory}>{item.category}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* BOTÓN VER TODOS */}
      <TouchableOpacity
        style={styles.viewAllBtn}
        onPress={() => navigation.navigate("Favoritos")} // 👈 CORREGIDO
      >
        <Text style={styles.viewAllText}>Ver todos los favoritos →</Text>
      </TouchableOpacity>

      {/* CONFIGURACIÓN DE IDIOMA */}
      <Text style={styles.sectionTitle}>Idioma</Text>
      <View style={styles.languageCard}>
        <Text style={styles.switchLabel}>
          {isEnglish ? "English" : "Español"}
        </Text>
        <Switch
          value={isEnglish}
          onValueChange={setIsEnglish}
          trackColor={{ false: "#ccc", true: "#62C170" }}
        />
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

    </View>
  );
}

// =============================
// ESTILOS
// =============================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 10,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  petName: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },

  email: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },

  noFavs: {
    fontSize: 15,
    color: "#777",
    marginBottom: 10,
  },

  favoriteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 3,
  },

  favoriteImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },

  favoriteName: {
    fontSize: 16,
    fontWeight: "700",
  },

  favoriteCategory: {
    fontSize: 13,
    color: "#62C170",
  },

  viewAllBtn: {
    marginBottom: 25,
  },

  viewAllText: {
    color: "#62C170",
    fontWeight: "700",
  },

  languageCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    elevation: 3,
  },

  switchLabel: {
    fontSize: 16,
    color: "#555",
  },

  logoutBtn: {
    backgroundColor: "#62C170",
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 40,
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
