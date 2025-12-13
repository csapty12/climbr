import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ExerciseLibraryScreen } from './src/features/exercise-library/screens/ExerciseLibraryScreen';
import { ExerciseDetailScreen } from './src/screens/ExerciseDetailScreen';
import { registerRootComponent } from 'expo';

export type RootStackParamList = {
  ExerciseLibrary: undefined;
  ExerciseDetail: { id: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} options={{ title: 'Exercises' }} />
        <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Detail' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
