import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterScreen({ navigation }) {
  const auth = getAuth();

  const [name, setName] = useState("");
  const [petName, setPetName] = useState("");
  const [avatar, setAvatar] = useState(""); // URL de imagen
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerUser = async () => {
    if (!name || !petName || !email || !password) {
      alert("Completa todos los campos");
      return;
    }

    try {
      // 👉 Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 👉 Crear documento del usuario en Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        petName,
        avatar:
          avatar ||
          "https://cdn-icons-png.flaticon.com/512/194/194938.png", // avatar por defecto
        email,
        createdAt: new Date(),
      });

      alert("Cuenta creada con éxito 🎉🐶");
      navigation.replace("HomeTabs");
    } catch (error) {
      console.log(error);
      alert("Error creando cuenta: " + error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.form}>
          <TextInput
            placeholder="Tu nombre completo"
            placeholderTextColor="#9E9E9E"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Nombre de tu mascota"
            placeholderTextColor="#9E9E9E"
            style={styles.input}
            value={petName}
            onChangeText={setPetName}
          />

          <TextInput
            placeholder="URL de tu foto (por ahora opcional)"
            placeholderTextColor="#9E9E9E"
            style={styles.input}
            value={avatar}
            onChangeText={setAvatar}
          />

          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor="#9E9E9E"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#9E9E9E"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.mainButton} onPress={registerUser}>
            <Text style={styles.mainButtonText}>Crear cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryText}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E9F8EE",
    alignItems: "center",
    paddingVertical: 40,
  },
  logo: {
    width: 170,
    height: 170,
    marginBottom: 10,
  },
  form: {
    width: "85%",
    backgroundColor: "#FFF",
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  input: {
    backgroundColor: "#F2F2F2",
    padding: 14,
    fontSize: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  mainButton: {
    backgroundColor: "#62C170",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  mainButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  secondaryButton: {
    alignItems: "center",
    padding: 12,
    marginTop: 10,
  },
  secondaryText: {
    color: "#62C170",
    fontSize: 16,
  },
});
