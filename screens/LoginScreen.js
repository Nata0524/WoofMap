import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

// --- 🔑 CLIENT IDS ACTUALES ---

// iOS Client ID (tipo "iOS")
const IOS_CLIENT_ID =
  "1057404440278-gcfjp703o4i1k4e95vk486bpo8kfsleu.apps.googleusercontent.com";

// Nuevo Web Client ID aprobado por Google
const EXPO_WEB_CLIENT_ID =
  "1057404440278-svsnqfq39lbi3jm84crcuh1205bd786f.apps.googleusercontent.com";

// Android Client ID vacío (evita conflicto)
const ANDROID_CLIENT_ID = "";

// --------------------------------------------------------------------

export default function LoginScreen({ navigation }) {
  // Configuración del request OAuth de Google
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    expoClientId: EXPO_WEB_CLIENT_ID,
    useProxy: true,
    scopes: ["profile", "email"],
  });

  // Captura de la respuesta de Google
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;

      console.log("LOGIN GOOGLE EXITOSO. TOKEN:", authentication?.accessToken);

      // Aquí puedes guardar el token en AsyncStorage si lo necesitas
      navigation.replace("HomeTabs");
    } else if (response?.type === "error") {
      console.error("Error de Google Login:", response.error);
    }
  }, [response]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Image source={require("../assets/logo.png")} style={styles.logo} />

      <View style={styles.form}>
        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#9E9E9E"
          style={styles.input}
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#9E9E9E"
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => navigation.replace("HomeTabs")}
        >
          <Text style={styles.mainButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <View style={styles.separatorWrapper}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>o continúa con</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Botón Google */}
        <TouchableOpacity style={styles.socialButton} onPress={() => promptAsync()}>
          <Image
            source={require("../assets/google.png")}
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>Continuar con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={require("../assets/apple.png")}
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>Continuar con Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.secondaryText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ---------- ESTILOS ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9F8EE",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 220,
    height: 220,
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
    marginTop: 5,
  },

  mainButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },

  separatorWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },

  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D9D9D9",
  },

  separatorText: {
    marginHorizontal: 10,
    color: "#777",
    fontSize: 14,
  },

  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  socialIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },

  socialText: {
    fontSize: 16,
    color: "#333",
  },

  secondaryButton: {
    alignItems: "center",
    padding: 12,
    marginTop: 5,
  },

  secondaryText: {
    color: "#62C170",
    fontSize: 16,
  },
});
