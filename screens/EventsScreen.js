// Importaciones de React y hooks
import React, { useState, useEffect } from "react";

// Componentes de React Native
import {
  View,
  Text,
  StyleSheet,
  FlatList, // Lista optimizada para muchos elementos
  Image,
  TouchableOpacity,
  ActivityIndicator, // Spinner de carga
} from "react-native";

// Iconos de Expo
import { Ionicons } from "@expo/vector-icons";

// Firebase Firestore
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

// ==============================
// Componente principal EventsScreen
// ==============================
export default function EventsScreen({ navigation }) {
  const [events, setEvents] = useState([]); // Estado para almacenar eventos
  const [loading, setLoading] = useState(true); // Estado para mostrar loader

  // ==============================
  // Cargar eventos desde Firestore
  // ==============================
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(), // Combina id y los datos del documento
        }));
        setEvents(eventsData); // Guardar en el estado
      } catch (error) {
        console.log("Error cargando eventos:", error);
      }
      setLoading(false); // Ocultar loader
    };

    fetchEvents();
  }, []);

  // ==============================
  // Renderizar cada evento en la lista
  // ==============================
  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("EventDetails", { event: item })} // Ir a detalles
    >
      {/* Imagen del evento */}
      <Image
        source={{
          uri:
            item.image ||
            "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg", // Imagen por defecto si no hay
        }}
        style={styles.image}
      />

      <View style={styles.info}>
        {/* Nombre del evento */}
        <Text style={styles.eventTitle}>{item.name}</Text>

        {/* Fecha */}
        <View style={styles.row}>
          <Ionicons name="calendar" size={18} color="#62C170" />
          <Text style={styles.text}>{item.date}</Text>
        </View>

        {/* Ubicación */}
        <View style={styles.row}>
          <Ionicons name="location" size={18} color="#62C170" />
          <Text style={styles.text}>{item.location}</Text>
        </View>

        {/* Botón para ver detalles */}
        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => navigation.navigate("EventDetails", { event: item })}
        >
          <Text style={styles.detailsText}>Ver detalles</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // ==============================
  // Renderizado principal
  // ==============================
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eventos Pet-Friendly</Text>

      {loading ? (
        // Mostrar loader mientras carga
        <ActivityIndicator size="large" color="#62C170" style={{ marginTop: 50 }} />
      ) : events.length === 0 ? (
        // Mostrar mensaje si no hay eventos
        <Text style={styles.noEvents}>No hay eventos por ahora 🐾</Text>
      ) : (
        // Lista de eventos
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

// ========================
// ESTILOS
// ========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Espacio superior para el notch/status bar
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
  },
  noEvents: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 16,
    color: "#777",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3, // Sombra en Android
  },
  image: {
    width: "100%",
    height: 170,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  info: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  text: {
    marginLeft: 6,
    color: "#555",
    fontSize: 14,
  },
  detailsBtn: {
    marginTop: 15,
    backgroundColor: "#62C170",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  detailsText: {
    color: "#fff",
    fontWeight: "600",
  },
});
