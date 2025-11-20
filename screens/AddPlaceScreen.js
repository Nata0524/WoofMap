// screens/AddPlaceScreen.js
import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Picker 
} from "react-native";
import * as ImagePicker from "expo-image-picker";

// Componente principal de la pantalla
export default function AddPlaceScreen({ navigation }) {
  // Estados para manejar la información del lugar
  const [name, setName] = useState(""); // Nombre del lugar
  const [location, setLocation] = useState(""); // Ubicación del lugar
  const [category, setCategory] = useState("Parque"); // Categoría seleccionada
  const [image, setImage] = useState(null); // Imagen seleccionada (URI)

  // Función para abrir la galería y seleccionar una imagen
  const pickImage = async () => {
    // Solicitar permisos para acceder a la galería
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Se necesita permiso para acceder a la galería!");
      return;
    }

    // Abrir la galería para seleccionar una imagen
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Solo imágenes
      quality: 0.7, // Calidad de la imagen (0.0 - 1.0)
    });

    // Si el usuario selecciona una imagen, actualizar el estado
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // Función para "enviar" el lugar (simulación)
  const submitPlace = () => {
    // Validar que los campos no estén vacíos
    if (!name.trim() || !location.trim()) return;

    // Mostrar un alert con los datos (solo ejemplo)
    alert(`Lugar agregado (fake) ✅\n${name}, ${location}, ${category}`);

    // Volver a la pantalla anterior
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>Agregar un nuevo lugar</Text>

      {/* Input para el nombre */}
      <TextInput 
        placeholder="Nombre del lugar" 
        style={styles.input} 
        value={name} 
        onChangeText={setName} 
      />

      {/* Input para la ubicación */}
      <TextInput 
        placeholder="Ubicación" 
        style={styles.input} 
        value={location} 
        onChangeText={setLocation} 
      />

      {/* Botón para seleccionar imagen */}
      <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
        <Text style={styles.imageBtnText}>
          {image ? "Imagen seleccionada ✅" : "Agregar imagen"}
        </Text>
      </TouchableOpacity>

      {/* Previsualización de la imagen seleccionada */}
      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      {/* Selector de categoría */}
      <Text style={{ marginTop: 10, fontWeight: "600" }}>Categoría:</Text>
      <Picker 
        selectedValue={category} 
        onValueChange={(itemValue) => setCategory(itemValue)}
      >
        <Picker.Item label="Parque" value="Parque" />
        <Picker.Item label="Veterinaria" value="Veterinaria" />
        <Picker.Item label="Café / Pet-Friendly" value="Cafe" />
        <Picker.Item label="Otro" value="Otro" />
      </Picker>

      {/* Botón para enviar el lugar */}
      <TouchableOpacity style={styles.submitBtn} onPress={submitPlace}>
        <Text style={styles.submitText}>Agregar lugar</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos de la pantalla
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 20, color: "#333" },
  input: { 
    height: 50, borderColor: "#ccc", borderWidth: 1, borderRadius: 12, 
    padding: 10, marginBottom: 15 
  },
  imageBtn: { 
    backgroundColor: "#62C170", padding: 12, borderRadius: 12, 
    alignItems: "center", marginBottom: 10 
  },
  imageBtnText: { color: "#fff", fontWeight: "600" },
  previewImage: { width: "100%", height: 180, borderRadius: 12, marginBottom: 15 },
  submitBtn: { 
    backgroundColor: "#62C170", padding: 14, borderRadius: 12, 
    alignItems: "center", marginTop: 10 
  },
  submitText: { color: "#fff", fontWeight: "700" },
});
