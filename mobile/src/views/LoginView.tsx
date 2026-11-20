import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { cadastrar, API_URL } from '../services/api';

export default function LoginView({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!email.trim() || !senha) {
      Alert.alert('Atenção', 'Informe seu e-mail e sua senha.');
      return;
    }

    try {
      setCarregando(true);

      // 1. Autenticação na API
      const respostaLogin = await cadastrar<any>('auth/login', {
        email: email.trim().toLowerCase(),
        senha,
      });

      const usuario = respostaLogin.usuario || respostaLogin;
      const token = respostaLogin.token;

      if (!token || !usuario) {
        Alert.alert(
          'Erro',
          'A API não retornou os dados necessários para o login.'
        );
        return;
      }

      // 2. Inicializa os dados comuns
      let comercioId: number | null = null;
      let nomeComercio = usuario.nome;

      // 3. Busca dados complementares somente para DOADOR
      if (usuario.tipoUsuario === 'DOADOR') {
        try {
          const resDoadores = await fetch(`${API_URL}/doadores`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (resDoadores.ok) {
            const listaDoadores = await resDoadores.json();

            const doadorEncontrado = listaDoadores.find(
              (d: any) =>
                Number(d.usuarioId) === Number(usuario.id)
            );

            if (doadorEncontrado) {
              comercioId = doadorEncontrado.id;

              nomeComercio =
                doadorEncontrado.nomeFantasia ||
                doadorEncontrado.razaoSocial ||
                usuario.nome;
            }
          }
        } catch (errDoador) {
          console.warn(
            'Não foi possível carregar dados complementares do doador:',
            errDoador
          );
        }
      }

      // 4. Verifica se o tipo de usuário é permitido
      if (
        usuario.tipoUsuario !== 'DOADOR' &&
        usuario.tipoUsuario !== 'ADMIN'
      ) {
        Alert.alert(
          'Acesso não permitido',
          'Tipo de usuário não reconhecido.'
        );
        return;
      }

      // 5. Navega para o aplicativo
      navigation.replace('Principal', {
        usuarioId: usuario.id,
        comercioId,
        nomeComercio,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        token,
      });

    } catch (error: any) {
      console.error('Erro ao realizar login:', error);

      Alert.alert(
        'Erro ao entrar',
        error?.message ||
          'Não foi possível acessar o servidor. Verifique se o backend Next.js está rodando.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>AlimentaTodos</Text>

      <Text style={styles.title}>Acesso ao sistema</Text>

      <Text style={styles.subtitle}>
        Gerencie suas doações de alimentos.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!carregando}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        editable={!carregando}
      />

      <Pressable
        style={[
          styles.button,
          carregando && styles.buttonDisabled,
        ]}
        onPress={entrar}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.registerButton}
        onPress={() => navigation.navigate('CadastroComercio')}
        disabled={carregando}
      >
        <Text style={styles.registerText}>
          Não tem uma conta? Cadastre seu comércio
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F5F8F3',
  },

  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#238447',
    textAlign: 'center',
    marginBottom: 32,
  },

  title: {
    fontSize: 23,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DED4',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#238447',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  registerButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },

  registerText: {
    color: '#238447',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});