import { createStackNavigator } from "@react-navigation/stack"
import CommunityScreen from "../screens/main/community/CommunityScreen"
import ClubDetailScreen from "../screens/main/community/ClubDetailScreen"
import CreateClubScreen from "../screens/main/community/CreateClubScreen"
import WorkshopScreen from "../screens/main/community/WorkshopScreen"
import IDEScreen from "../screens/main/community/IDEScreen"
import MembersScreen from "../screens/main/community/MembersScreen"
import ChallengeScreen from "../screens/main/community/ChallengeScreen"

const Stack = createStackNavigator()

const CommunityNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
      <Stack.Screen name="CreateClub" component={CreateClubScreen} />
      <Stack.Screen name="Workshop" component={WorkshopScreen} />
      <Stack.Screen name="IDE" component={IDEScreen} />
      <Stack.Screen name="Members" component={MembersScreen} />
      <Stack.Screen name="Challenge" component={ChallengeScreen} />
    </Stack.Navigator>
  )
}

export default CommunityNavigator
