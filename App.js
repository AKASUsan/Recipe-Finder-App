import { StatusBar } from "expo-status-bar";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Homepage from "./screens/Homepage";

// --- Add more screens here as you create them ---
// import MealDetailScreen from "./screens/MealDetailScreen";
// import FavoritesScreen from "./screens/FavoritesScreen";
// import OrdersScreen from "./screens/OrdersScreen";

const Stack = createNativeStackNavigator();
const BottomTabs = createBottomTabNavigator();
function BottomTabNavigator() {
  return (
    <BottomTabs.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: "#FFFFFF" },
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