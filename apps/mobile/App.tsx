import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ExerciseLibraryScreen } from './src/features/exercise-library/screens/ExerciseLibraryScreen';
import { ExerciseDetailScreen } from './src/screens/ExerciseDetailScreen';

import { ConfigureSessionScreen, RunSessionScreen, SessionSummaryScreen } from './src/features/execute-session/screens';

export type RootStackParamList = {
  ExerciseLibrary: undefined;
  ExerciseDetail: { exerciseId: string };
  // Execute Session Feature
  ConfigureSession: { exerciseId: string }; // We pass ID, or full object? Usually ID and re-fetch or pass object if simple. 
  // Let's stick to simple ID for now or object if we want to avoid re-fetch.
  // Given "ExerciseDetail" passes ID, let's allow passing the object to Run to avoid double fetch if possible, 
  // OR just assume we have it. 
  // Wait, Navigation Types need to be consistent. 
  // Let's defer to the "types.ts" I just created, but maybe I should just inline them here for simplicity in this file 
  // or export RootStackParamList from a central type file.
  // For now, I will add them here matching the existing pattern.
  RunSession: { exerciseId: string; config: any };
  SessionSummary: { exerciseId: string; result: any };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} options={{ title: 'Climbr' }} />
        <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Exercise Details' }} />

        <Stack.Screen name="ConfigureSession" component={ConfigureSessionScreen} options={{ title: 'Configure Session' }} />
        <Stack.Screen name="RunSession" component={RunSessionScreen} options={{ title: 'Run Session', headerShown: false }} />
        <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} options={{ title: 'Summary' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
