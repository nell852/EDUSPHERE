import { createStackNavigator } from "@react-navigation/stack"
import LibraryScreen from "../screens/main/library/LibraryScreen"
import BookDetailScreen from "../screens/main/library/BookDetailScreen"
import BookViewerScreen from "../screens/main/library/BookViewerScreen"

const Stack = createStackNavigator()

const LibraryNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="BookViewer" component={BookViewerScreen} />
    </Stack.Navigator>
  )
}

export default LibraryNavigator
