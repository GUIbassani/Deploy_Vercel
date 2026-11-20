
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return <AppNavigator />;
}

registerRootComponent(App);
