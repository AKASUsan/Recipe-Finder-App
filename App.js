import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Pressable } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import { AuthProvider } from "./store/context/AuthContext";

import Homepage from "./screens/Homepage";
import RecipeDetailScreen from "./screens/RecipeDetailScreen";
import CategoryRecipesScreen from "./screens/CategoryRecipesScreen";
import SearchPage from "./screens/SearchPage";
import FavoritesPage from "./screens/Favoritespage";
import ProfilePage from "./screens/ProfilePage";
import LoginScreen from "./screens/LoginScreen";
import AddRecipeScreen from "./screens/Addrecipescreen";
import FavoritesContextProvider from "./store/context/favorites-context";

const Stack = createNativeStackNavigator();
const BottomTabs = createBottomTabNavigator();

const EmptyScreen = () => null;

function AddTabButton({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add recipe"
      style={styles.addWrapper}
    >
      <View style={styles.addButton}>
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

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
        name="AddTab"
        component={EmptyScreen}
        options={({ navigation }) => ({
          tabBarButton: () => (
            <AddTabButton onPress={() => navigation.navigate("AddRecipe")} />
          ),
        })}
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
      <BottomTabs.Screen
        name="User"
        component={ProfilePage}
        options={{
          title: "Profile",
          headerShown: false, // ProfilePage draws its own header
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </BottomTabs.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <FavoritesContextProvider>
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
            <Stack.Screen
              name="RecipeDetail"
              component={RecipeDetailScreen}
              options={({ route }) => ({ title: route.params.recipe.title })}
            />
            <Stack.Screen
              name="CategoryRecipes"
              component={CategoryRecipesScreen}
              options={({ route }) => ({ title: route.params.category.title })}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: "Account" }}
            />
            <Stack.Screen
              name="AddRecipe"
              component={AddRecipeScreen}
              options={{ title: "Add recipe" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </FavoritesContextProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  addWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E08E79",
    alignItems: "center",
    justifyContent: "center",
  },
});
