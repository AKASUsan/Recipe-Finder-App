import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import Homepage from "./screens/Homepage";
import SearchPage from "./screens/SearchPage";
import FavoritesPage from "./screens/FavoritesPage"; //FavoritesPage mew

const Stack = createNativeStackNavigator();
const BottomTabs = createBottomTabNavigator();
function BottomTabNavigator() {
  return (
    <BottomTabs.Navigator
      screenOptions={{
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          height: 64,
          paddingTop: 0,
          paddingBottom: 0,
          backgroundColor: "transparent",
          borderRadius: 32,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.6)",
          borderTopWidth: 1,
          elevation: 0,
          overflow: "hidden",
        },
        tabBarBackground: () => (
          <BlurView
            intensity={40}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarItemStyle: {
          borderRadius: 50,
          marginVertical: 6,
          marginHorizontal: 4,
          justifyContent: "center",
          overflow: "hidden",
        },

        tabBarInactiveTintColor: "#8A7A6E",
        tabBarActiveBackgroundColor: "#FFF1E6",
        tabBarActiveTintColor: "#E08E79",
        headerStyle: { backgroundColor: "#FFF1E6" },
        headerTintColor: "#4A3728",
      }}
    >
      <BottomTabs.Screen
        name="Home"
        component={Homepage}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="Search"
        component={SearchPage}
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="Favorites"
        component={FavoritesPage}
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
    </BottomTabs.Navigator>
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#FFF1E6" },
            headerTintColor: "#4A3728",
            contentStyle: { backgroundColor: "#FFF1E6" },
          }}
        >
          <Stack.Screen
            name="Main"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
