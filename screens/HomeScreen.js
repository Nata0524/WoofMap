import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location"; // Para obtener ubicación del usuario
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // Iconos

// 🔹 Firebase
import { db } from "../firebaseConfig"; // Conexión Firestore
import { collection, getDocs } from "firebase/firestore"; // Para leer datos
import { getAuth } from "firebase/auth"; // Para autenticar usuario

export default function HomeScreen({ navigation, route }) {
  // Estados principales
  const [location, setLocation] = useState(null); // Ubicación actual
  const [loading, setLoading] = useState(true); // Estado de carga del mapa
  const [search, setSearch] = useState(""); // Texto de búsqueda
  const [places, setPlaces] = useState([]); // Lista de lugares de Firebase
  const [selectedPlace, setSelectedPlace] = useState(null); // Lugar seleccionado
  const [selectedCategory, setSelectedCategory] = useState(null); // Filtro de categoría

  const slideAnim = useRef(new Animated.Value(300)).current; // Animación de tarjeta inferior
  const mapRef = useRef(null); // Referencia al MapView

  const auth = getAuth();
  const user = auth.currentUser; // Usuario autenticado

  // 🔹 Obtener ubicación del usuario al montar componente
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync(); // Pedir permiso
      if (status !== "granted") {
        alert("Se necesitan permisos de ubicación.");
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({}); // Obtener coordenadas
      setLocation(loc.coords);
      setLoading(false); // Fin de carga
    })();
  }, []);

  // 🔹 Cargar lugares desde Firebase
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const snapshot = await getDocs(collection(db, "places")); // Leer colección
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(), // Guardar todos los campos del documento
        }));
        setPlaces(data); // Guardar en el estado
      } catch (error) {
        console.log("Error cargando lugares:", error);
      }
    };
    loadPlaces();
  }, []);

  // 🔹 Centrar mapa si venimos de otra pantalla
  useEffect(() => {
    if (route.params?.centerLocation && places.length > 0) {
      const { lat, lng, placeId } = route.params.centerLocation;

      const place = places.find(
        (p) => p.id === placeId || (p.lat === lat && p.lng === lng)
      );

      if (place) {
        setSelectedPlace(place); // Mostrar tarjeta
        showCard(); // Animación tarjeta
      }

      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  }, [route.params?.centerLocation, places]);

  // 🔹 Animación tarjeta inferior
  const showCard = () => {
    Animated.timing(slideAnim, {
      toValue: 0, // Desplazar hacia arriba
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideCard = () => {
    Animated.timing(slideAnim, {
      toValue: 300, // Ocultar tarjeta
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSelectedPlace(null));
  };

  // 🔹 Mostrar loader mientras carga la ubicación
  if (loading || !location) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#62C170" />
        <Text style={{ marginTop: 10 }}>Cargando mapa...</Text>
      </View>
    );
  }

  // 🔹 Categorías de lugares
  const categories = [
    { name: "Parques", icon: "tree" },
    { name: "Cafés", icon: "coffee" },
    { name: "Restaurantes", icon: "silverware-fork-knife" },
    { name: "Veterinarias", icon: "dog" },
    { name: "Hoteles", icon: "bed" },
    { name: "Eventos", icon: "calendar-star" },
  ];

  return (
    <View style={styles.container}>
      {/* 🔹 MAPA */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation={true}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* 🔹 MARKERS CON HUELLITA */}
        {places
          .filter((place) => {
            const matchCategory = selectedCategory
              ? place.category === selectedCategory
              : true;
            const matchSearch = place.name
              .toLowerCase()
              .includes(search.toLowerCase());
            return matchCategory && matchSearch;
          })
          .map((place) => (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.lat, longitude: place.lng }}
              onPress={() => {
                setSelectedPlace(place); // Selecciona lugar
                showCard(); // Animación tarjeta
                mapRef.current?.animateToRegion(
                  {
                    latitude: place.lat,
                    longitude: place.lng,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  },
                  500
                );
              }}
            >
              <Image
                source={require("../assets/huellita.png")}
                style={{
                  width: selectedPlace?.id === place.id ? 52 : 40,
                  height: selectedPlace?.id === place.id ? 52 : 40,
                  tintColor:
                    selectedPlace?.id === place.id ? "#62C170" : "#333",
                }}
                resizeMode="contain"
              />
            </Marker>
          ))}
      </MapView>

      {/* 🔹 BUSCADOR */}
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={20}
          color="#5A5A5A"
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Buscar lugares pet-friendly..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={(t) => {
            setSearch(t); // Actualiza búsqueda
            setSelectedPlace(null); // Limpiar tarjeta seleccionada
          }}
          style={{ flex: 1, fontSize: 16 }}
        />
      </View>

      {/* 🔹 CATEGORÍAS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryButton,
              selectedCategory === cat.name ? styles.categorySelected : null,
            ]}
            onPress={() => {
              setSelectedCategory(
                selectedCategory === cat.name ? null : cat.name
              ); // Alterna categoría
              setSelectedPlace(null); // Limpiar tarjeta seleccionada
            }}
          >
            <MaterialCommunityIcons
              name={cat.icon}
              size={26}
              color="#62C170"
            />
            <Text style={styles.categoryLabel}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 🔹 TARJETA INFERIOR DE LUGAR */}
      {selectedPlace && (
        <Animated.View
          style={[styles.bottomCard, { transform: [{ translateY: slideAnim }] }]}
        >
          <Image
            source={{ uri: selectedPlace.image }}
            style={styles.cardImage}
          />

          <View style={{ padding: 10 }}>
            <Text style={styles.cardTitle}>{selectedPlace.name}</Text>
            <Text style={styles.cardCategory}>{selectedPlace.category}</Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.ratingText}>
                {selectedPlace.rating || "N/A"}
              </Text>
            </View>

            {/* Botón ver detalles */}
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() =>
                navigation.navigate("PlaceDetails", {
                  place: selectedPlace,
                })
              }
            >
              <Text style={styles.detailText}>Ver detalles</Text>
            </TouchableOpacity>

            {/* Botón cerrar tarjeta */}
            <TouchableOpacity onPress={hideCard} style={styles.closeButton}>
              <Text style={{ color: "#62C170" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// 🔹 ESTILOS
const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  searchBar: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: "85%",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },

  categoriesContainer: { position: "absolute", top: 130 },
  categoryButton: {
    backgroundColor: "#FFF",
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  categorySelected: {
    backgroundColor: "#62C17022",
    borderWidth: 2,
    borderColor: "#62C170",
  },
  categoryLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#62C170",
    fontWeight: "600",
  },

  bottomCard: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 8,
    elevation: 10,
  },
  cardImage: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardTitle: { fontSize: 20, fontWeight: "700" },
  cardCategory: { marginTop: 3, fontSize: 14, color: "#62C170" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  ratingText: { marginLeft: 4, fontSize: 15 },
  detailButton: {
    marginTop: 12,
    backgroundColor: "#62C170",
    padding: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  detailText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  closeButton: { alignItems: "center", marginTop: 10 },
});
