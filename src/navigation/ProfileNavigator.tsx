import { createStackNavigator } from "@react-navigation/stack"
import ProfileScreen from "../screens/main/profile/ProfileScreen"
import EditProfileScreen from "../screens/main/profile/EditProfileScreen"
import PrivacySettingsScreen from "../screens/main/profile/PrivacySettingsScreen"
import StorageManagementScreen from "../screens/main/profile/StorageManagementScreen"
import ColleaguesScreen from "../screens/main/profile/ColleaguesScreen"
import ChatScreen from "../screens/main/profile/ChatScreen"
import MyJourneyScreen from "../screens/main/profile/MyJourneyScreen"
import ProjectDetailScreen from "../screens/main/profile/ProjectDetailScreen"
import CVGeneratorScreen from "../screens/main/profile/CVGeneratorScreen"
import HistoryScreen from "../screens/main/profile/HistoryScreen"
import NotificationsScreen from "../screens/main/profile/NotificationsScreen"

const Stack = createStackNavigator()

const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="StorageManagement" component={StorageManagementScreen} />
      <Stack.Screen name="Colleagues" component={ColleaguesScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="MyJourney" component={MyJourneyScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="CVGenerator" component={CVGeneratorScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  )
}

export default ProfileNavigator
