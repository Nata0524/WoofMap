// navigation/AppNavigator.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

import HomeScreen from "../screens/HomeScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import EventsScreen from "../screens/EventsScreen";
import CommunityScreen from "../screens/CommunityScreen";
import ProfileScreen from "../screens/ProfileScreen";

import PlaceDetailsScreen from "../screens/PlaceDetailsScreen";
import EventDetailsScreen from "../screens/EventDetails";
import AddCommentScreen from "../screens/AddCommentScreen";
import AddPlaceScreen from "../screens/AddPlaceScreen";

// 👉 FALTABA ESTE IMPORT
import PostCommentsScreen from "../screens/PostCommentsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: "#fff" },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Eventos") iconName = focused ? "calendar" : "calendar-outline";
          else if (route.name === "Favoritos") iconName = focused ? "heart" : "heart-outline";
          else if (route.name === "Comunidad") iconName = focused ? "people" : "people-outline";
          else if (route.name === "Perfil") iconName = focused ? "person" : "person-outline";

          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: "#62C170",
        tabBarInactiveTintColor: "#777",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Eventos" component={EventsScreen} />
      <Tab.Screen name="Favoritos" component={FavoritesScreen} />
      <Tab.Screen name="Comunidad" component={CommunityScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* Public */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Autenticadas */}
        <Stack.Screen name="HomeTabs" component={HomeTabs} />

        {/* Detalles */}
        <Stack.Screen name="PlaceDetails" component={PlaceDetailsScreen} />
        <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
        <Stack.Screen name="AddComment" component={AddCommentScreen} />
        <Stack.Screen name="AddPlace" component={AddPlaceScreen} />

        {/* Comentarios del Post */}
        <Stack.Screen name="PostComments" component={PostCommentsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
