
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import {
  CommonActions,
  DrawerActions,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import CadastroComercioView from '../views/CadastroComercioView';
import CadastroInstituicaoView from '../views/CadastroInstituicaoView';
import DoacoesRealizadasView from '../views/DoacoesRealizadasView';
import EditarDoadorView from '../views/EditarDoadoresView';
import EditarPerfilView from '../views/EditarPerfilView';
import GerenciarDoacoesView from '../views/GerenciarDoacoesView';
import GerenciarDoadoresView from '../views/GerenciarDoadoresView';
import HomeView from '../views/HomeView';
import LoginView from '../views/LoginView';
import NovaDoacaoView from '../views/NovaDoacaoView';
import PerfilView from '../views/PerfilView';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function TabsNavigator({ route }: any) {
  const dadosUsuario = route?.params || {};

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#237A57',
        tabBarInactiveTintColor: '#8A968D',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E7ECE5',
          height: 62,
          paddingBottom: 7,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Início"
        component={HomeView}
        initialParams={dadosUsuario}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>⌂</Text>
          ),
        }}
      />

      {dadosUsuario.tipoUsuario === 'DOADOR' && (
        <Tab.Screen
          name="Minhas doações"
          component={DoacoesRealizadasView}
          initialParams={dadosUsuario}
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>☷</Text>
            ),
          }}
        />
      )}

      <Tab.Screen
        name="Perfil"
        component={PerfilView}
        initialParams={dadosUsuario}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function MainStackNavigator({ route }: any) {
  const dadosUsuario = route?.params || {};

  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#237A57',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
      }}
    >
      <MainStack.Screen
        name="Painel"
        component={TabsNavigator}
        initialParams={dadosUsuario}
        options={({ navigation }) => ({
          title: 'AlimentaTodos',
          headerLeft: () => (
            <Pressable
              onPress={() =>
                navigation.getParent()?.dispatch(DrawerActions.toggleDrawer())
              }
              style={{ paddingRight: 18 }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 25 }}>☰</Text>
            </Pressable>
          ),
        })}
      />

      <MainStack.Screen
        name="GerenciarDoadores"
        component={GerenciarDoadoresView}
        initialParams={dadosUsuario}
        options={{ title: 'Gerenciar doadores' }}
      />

      <MainStack.Screen
        name="EditarDoador"
        component={EditarDoadorView}
        options={{ title: 'Editar doador' }}
      />

      <MainStack.Screen
        name="Nova doação"
        component={NovaDoacaoView}
        initialParams={{
          usuarioId: dadosUsuario.usuarioId,
          comercioId: dadosUsuario.comercioId,
          nomeComercio: dadosUsuario.nomeComercio,
          email: dadosUsuario.email,
          token: dadosUsuario.token,
        }}
        options={{ title: 'Nova doação' }}
      />

      <MainStack.Screen
        name="GerenciarDoacoes"
        component={GerenciarDoacoesView}
        initialParams={dadosUsuario}
        options={{ title: 'Gerenciar doações' }}
      />

      <MainStack.Screen
        name="EditarPerfil"
        component={EditarPerfilView}
        initialParams={dadosUsuario}
        options={{ title: 'Editar perfil' }}
      />

      <MainStack.Screen
        name="CadastroInstituicao"
        component={CadastroInstituicaoView}
        initialParams={dadosUsuario}
        options={{ title: 'Instituições' }}
      />
    </MainStack.Navigator>
  );
}

function MenuLateral(props: any) {
  const { navigation } = props;

  const rotaPrincipal = props.state.routes.find(
    (rota: any) => rota.name === 'Principal',
  );

  const dadosUsuario = rotaPrincipal?.params || {};
  const tipoUsuario = dadosUsuario.tipoUsuario;

  function abrirTela(screen: string, nestedScreen?: string) {
    if (nestedScreen) {
      navigation.navigate('Principal', {
        screen: 'Painel',
        params: {
          screen: nestedScreen,
        },
      });
    } else {
      navigation.navigate('Principal', {
        screen,
        params: dadosUsuario,
      });
    }

    navigation.closeDrawer();
  }

  function sair() {
    navigation.getParent()?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
  }

  return (
    <DrawerContentScrollView
      style={styles.drawer}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerLogo}>🌱 AlimentaTodos</Text>
        <Text style={styles.drawerSubtitle}>
          Painel do comércio parceiro
        </Text>
      </View>

      <View style={styles.drawerSection}>
        <Text style={styles.sectionLabel}>MENU PRINCIPAL</Text>

        <DrawerItem
          label="Início"
          onPress={() => abrirTela('Painel', 'Início')}
          labelStyle={styles.drawerLabel}
          icon={() => <Text style={styles.drawerIcon}>⌂</Text>}
        />

        {tipoUsuario === 'DOADOR' && (
          <>
            <DrawerItem
              label="Minhas doações"
              onPress={() => abrirTela('Painel', 'Minhas doações')}
              labelStyle={styles.drawerLabel}
              icon={() => <Text style={styles.drawerIcon}>☷</Text>}
            />

            <DrawerItem
              label="Nova doação"
              onPress={() => abrirTela('Nova doação')}
              labelStyle={styles.drawerLabel}
              icon={() => <Text style={styles.drawerIcon}>＋</Text>}
            />
          </>
        )}

        {tipoUsuario === 'ADMIN' && (
          <>
            <DrawerItem
              label="Gerenciar doações"
              onPress={() => abrirTela('GerenciarDoacoes')}
              labelStyle={styles.drawerLabel}
              icon={() => <Text style={styles.drawerIcon}>☷</Text>}
            />

            <DrawerItem
              label="Gerenciar doadores"
              onPress={() => abrirTela('GerenciarDoadores')}
              labelStyle={styles.drawerLabel}
              icon={() => <Text style={styles.drawerIcon}>👥</Text>}
            />

            <DrawerItem
              label="Instituições"
              onPress={() => abrirTela('CadastroInstituicao')}
              labelStyle={styles.drawerLabel}
              icon={() => <Text style={styles.drawerIcon}>🏥</Text>}
            />
          </>
        )}
      </View>

      <View style={styles.drawerSection}>
        <Text style={styles.sectionLabel}>MINHA CONTA</Text>

        <DrawerItem
          label="Meu perfil"
          onPress={() => abrirTela('Painel', 'Perfil')}
          labelStyle={styles.drawerLabel}
          icon={() => <Text style={styles.drawerIcon}>👤</Text>}
        />

        <DrawerItem
          label="Editar perfil"
          onPress={() => abrirTela('EditarPerfil')}
          labelStyle={styles.drawerLabel}
          icon={() => <Text style={styles.drawerIcon}>✎</Text>}
        />
      </View>

      <View style={styles.drawerFooter}>
        <View style={styles.drawerDivider} />

        <DrawerItem
          label="Sair da conta"
          onPress={sair}
          labelStyle={{ ...styles.drawerLabel, color: '#C44747' }}
          icon={() => <Text style={styles.drawerIcon}>↪</Text>}
        />

        <Text style={styles.version}>AlimentaTodos • 1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

function DrawerNavigator({ route }: any) {
  const dadosUsuario = route?.params || {};

  return (
    <Drawer.Navigator
      drawerContent={(props) => <MenuLateral {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: 285,
        },
        overlayColor: 'rgba(0,0,0,0.35)',
      }}
    >
      <Drawer.Screen
        name="Principal"
        component={MainStackNavigator}
        initialParams={dadosUsuario}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Login">
        <RootStack.Screen
          name="Login"
          component={LoginView}
          options={{ headerShown: false }}
        />

        <RootStack.Screen
          name="CadastroComercio"
          component={CadastroComercioView}
          options={{ title: 'Cadastro do comércio' }}
        />

        <RootStack.Screen
          name="Principal"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    backgroundColor: '#237A57',
    paddingHorizontal: 20,
    paddingTop: 38,
    paddingBottom: 28,
    marginBottom: 15,
  },
  drawerLogo: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  drawerSubtitle: {
    color: '#E5F4E9',
    fontSize: 12,
    marginTop: 7,
  },
  drawerSection: {
    marginBottom: 18,
  },
  sectionLabel: {
    color: '#91A096',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 20,
    marginBottom: 5,
    letterSpacing: 1,
  },
  drawerLabel: {
    color: '#26372D',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: -12,
  },
  drawerIcon: {
    fontSize: 20,
    color: '#237A57',
  },
  drawerFooter: {
    marginTop: 'auto',
    paddingBottom: 15,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#E7ECE5',
    marginHorizontal: 18,
    marginBottom: 8,
  },
  version: {
    color: '#A0AAA2',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 8,
  },
});
