import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Pressable, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import { AuthProvider } from "./store/context/AuthContext";
import { ToastProvider } from "./components/Toast";

import Homepage from "./screens/Homepage";
import RecipeDetailScreen from "./screens/RecipeDetailScreen";
import CategoryRecipesScreen from "./screens/CategoryRecipesScreen";
import SearchPage from "./screens/SearchPage";
import FavoritesPage from "./screens/Favoritespage";
import ProfilePage from "./screens/ProfilePage";
import LoginScreen from "./screens/LoginScreen";
import AddRecipeScreen from "./screens/Addrecipescreen";
import AllRecipesScreen from "./screens/AllRecipesScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import FollowListScreen from "./screens/FollowListScreen";
import FavoritesContextProvider from "./store/context/favorites-context";
import RegisterScreen from "./screens/Registerscreen";

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

function TabLabel({ focused, children }) {
  return (
    <View style={styles.labelWrap}>
      <Text
        style={[
          styles.label,
          { color: focused ? "#FFB8A3" : "#E3D5C9" },
          focused && styles.labelActive,
        ]}
      >
        {children}
      </Text>
      <View style={[styles.dot, focused && styles.dotActive]} />
    </View>
  );
}

function TabBarBackground() {
  const isIOS = Platform.OS === "ios";
  return (
    <View style={StyleSheet.absoluteFill}>
      {isIOS && (
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      )}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: `rgb(55, 53, 62, ${isIOS ? 0.6 : 0.88})`,
          },
        ]}
      />
    </View>
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
          borderColor: "rgba(255, 255, 255, 0.12)",
          borderTopWidth: 1,
          elevation: 0,
          overflow: "hidden",
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarLabel: ({ focused, children }) => (
          <TabLabel focused={focused}>{children}</TabLabel>
        ),
        tabBarItemStyle: {
          borderRadius: 50,
          marginVertical: 6,
          marginHorizontal: 4,
          justifyContent: "center",
          overflow: "hidden",
        },
        tabBarInactiveTintColor: "#E3D5C9",
        tabBarActiveBackgroundColor: "transparent",
        tabBarActiveTintColor: "#FFB8A3",
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
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="Search"
        component={SearchPage}
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
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
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="User"
        component={ProfilePage}
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </BottomTabs.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <FavoritesContextProvider>
          <ToastProvider>
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
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="UserProfile"
                  component={UserProfileScreen}
                  options={({ route }) => ({
                    title: route.params?.name ?? "Profile",
                  })}
                />
                <Stack.Screen
                  name="FollowList"
                  component={FollowListScreen}
                  options={({ route }) => ({
                    title: route.params?.name ?? "Connections",
                  })}
                />
                <Stack.Screen
                  name="AllRecipes"
                  component={AllRecipesScreen}
                  options={({ route }) => ({
                    title: route.params?.title ?? "All recipes",
                  })}
                />
                <Stack.Screen
                  name="CategoryRecipes"
                  component={CategoryRecipesScreen}
                  options={({ route }) => ({
                    title: route.params.category.title,
                  })}
                />
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{ title: "Account" }}
                />
                <Stack.Screen
                  name="Register"
                  component={RegisterScreen}
                  options={{ title: "Create account" }}
                />
                <Stack.Screen
                  name="AddRecipe"
                  component={AddRecipeScreen}
                  options={{ title: "Add recipe" }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </ToastProvider>
        </FavoritesContextProvider>
      </AuthProvider>
    </SafeAreaProvider>
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
  labelWrap: { alignItems: "center", marginTop: 2 },
  label: { fontSize: 11 },
  labelActive: { fontWeight: "600" },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
    backgroundColor: "transparent",
  },
  dotActive: { backgroundColor: "#E08E79" },
});
