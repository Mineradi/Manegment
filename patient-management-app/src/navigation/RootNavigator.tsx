import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { AddPatientScreen } from '../screens/AddPatientScreen';
import { PatientProfileScreen } from '../screens/PatientProfileScreen';
import { NewVisitScreen } from '../screens/NewVisitScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Patient Manager' }}
      />
      <Stack.Screen
        name="AddPatient"
        component={AddPatientScreen}
        options={{ title: 'Add New Patient' }}
      />
      <Stack.Screen
        name="PatientProfile"
        component={PatientProfileScreen}
        options={{ title: 'Patient Profile' }}
      />
      <Stack.Screen
        name="NewVisit"
        component={NewVisitScreen}
        options={{ title: 'New Visit' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}
