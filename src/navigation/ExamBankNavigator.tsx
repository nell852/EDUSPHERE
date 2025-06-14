import { createStackNavigator } from "@react-navigation/stack"
import ExamBankScreen from "../screens/main/exambank/ExamBankScreen"
import SchoolSelectionScreen from "../screens/main/exambank/SchoolSelectionScreen"
import ExamDetailScreen from "../screens/main/exambank/ExamDetailScreen"
import ExamViewerScreen from "../screens/main/exambank/ExamViewerScreen"

const Stack = createStackNavigator()

const ExamBankNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SchoolSelection" component={SchoolSelectionScreen} />
      <Stack.Screen name="ExamBank" component={ExamBankScreen} />
      <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
      <Stack.Screen name="ExamViewer" component={ExamViewerScreen} />
    </Stack.Navigator>
  )
}

export default ExamBankNavigator
