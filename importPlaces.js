// importPlaces.js
import fetch from "node-fetch";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// ----------------------------
// 1️⃣ TU API KEY DE GOOGLE
// ----------------------------
const API_KEY = "TU_API_KEY_AQUI"; // <<< REEMPLAZAR

// ----------------------------
// 2️⃣ FIRESTORE CONFIG
// ----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyB0cRaOb_fbR_NXqg-Xpr31ewNGElLXoqs",
  authDomain: "woofmap-209ca.firebaseapp.com",
  projectId: "woofmap-209ca",
  storageBucket: "woofmap-209ca.firebasestorage.app",
  messagingSenderId: "920216560538",
  appId: "1:920216560538:web:84354927bafda690d95023",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ----------------------------
// 3️⃣ CATEGORÍAS A IMPORTAR
// ----------------------------

const QUERIES = [
  { query: "parques para perros en Bogota", category: "Parques" },
  { query: "cafes pet friendly en Bogota", category: "Cafés" },
  { query: "veterinarias en Bogota", category: "Veterinarias" },
  { query: "restaurantes pet friendly en Bogota", category: "Restaurantes" },
  { query: "hoteles pet friendly en Bogota", category: "Hoteles" },
];

// ----------------------------
// 🔥 Función para buscar en Google Places
// ----------------------------
async function searchPlaces(textQuery, categoryName) {
  const url =
    `https://places.googleapis.com/v1/places:searchText?key=${API_KEY}`;

  const body = {
    textQuery,
    maxResultCount: 20,
    locationBias: {
      circle: {
        center: {
          latitude: 4.65,
          longitude: -74.07,
        },
        radius: 30000, // 30 km alrededor de Bogotá
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await response.json();
  return json.places || [];
}

// ----------------------------
// 🔥 Guardar en Firestore
// ----------------------------
async function savePlaceToFirestore(place, category) {
  const location = place.location;

  if (!location) return;

  const docData = {
    name: place.displayName?.text || "Sin nombre",
    address: place.formattedAddress || "",
    category,
    lat: location.latitude,
    lng: location.longitude,
    rating: place.rating || null,
    image:
      place.photos?.length > 0
        ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${API_KEY}&maxHeightPx=800`
        : "https://via.placeholder.com/400",
    createdAt: new Date(),
  };

  await addDoc(collection(db, "places"), docData);
  console.log("Guardado:", docData.name);
}

// ----------------------------
// 🚀 MAIN FUNCTION
// ----------------------------
async function runImport() {
  console.log("🔥 Importando lugares reales de Bogotá...");

  for (let item of QUERIES) {
    console.log(`\n➡ Buscando: ${item.query}`);
    const results = await searchPlaces(item.query, item.category);

    for (let place of results) {
      await savePlaceToFirestore(place, item.category);
    }
  }

  console.log("\n✅ Importación COMPLETA 🎉🐶🔥");
}

runImport();
