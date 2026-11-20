
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';

import {
  buscarPerfil,
  atualizarPerfil,
  PerfilResponse,
} from '../services/api';

export default function EditarPerfilView({ route, navigation }: any) {
  const { token, tipoUsuario: tipoUsuarioParam } = route?.params || {};

  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');

  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [carregando, setCarregando] = useState(false);

  const tipoUsuario = perfil?.tipoUsuario || tipoUsuarioParam;
  const ehDoador = tipoUsuario === 'DOADOR';

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    if (!token) {
      Alert.alert(
        'Erro',
        'Token de autenticação não encontrado. Faça login novamente.'
      );

      setCarregandoPerfil(false);
      return;
    }

    try {
      setCarregandoPerfil(true);

      const dados = await buscarPerfil(token);

      setPerfil(dados);

      setNome(dados.nome || '');
      setEmail(dados.email || '');
      setTelefone(dados.telefone || '');

      if (dados.doador) {
        setRazaoSocial(dados.doador.razaoSocial || '');
        setNomeFantasia(dados.doador.nomeFantasia || '');
        setCnpj(dados.doador.cnpj || '');
        setEndereco(dados.doador.endereco || '');
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);

      Alert.alert(
        'Erro',
        error.message || 'Não foi possível carregar seus dados.'
      );
    } finally {
      setCarregandoPerfil(false);
    }
  }

  async function salvarPerfil() {
    if (!nome.trim() || !email.trim() || !telefone.trim()) {
      Alert.alert(
        'Atenção',
        'Preencha nome, e-mail e telefone.'
      );
      return;
    }

    if (ehDoador) {
      if (
        !razaoSocial.trim() ||
        !nomeFantasia.trim() ||
        !cnpj.trim() ||
        !endereco.trim()
      ) {
        Alert.alert(
          'Atenção',
          'Preencha todos os dados da instituição.'
        );
        return;
      }
    }

    if (!token) {
      Alert.alert(
        'Erro',
        'Token de autenticação não encontrado. Faça login novamente.'
      );
      return;
    }

    if (carregando) return;

    try {
      setCarregando(true);

      const dadosAtualizados: any = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone.trim(),
      };

      if (ehDoador) {
        dadosAtualizados.razaoSocial = razaoSocial.trim();
        dadosAtualizados.nomeFantasia = nomeFantasia.trim();
        dadosAtualizados.cnpj = cnpj.replace(/\D/g, '');
        dadosAtualizados.endereco = endereco.trim();
      }

      await atualizarPerfil(dadosAtualizados, token);

      Alert.alert(
        'Sucesso',
        'Perfil atualizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);

      Alert.alert(
        'Erro',
        error.message || 'Não foi possível atualizar seus dados.'
      );
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoPerfil) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#238447" />

        <Text style={styles.loadingText}>
          Carregando perfil...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Text style={styles.logo}>AlimentaTodos</Text>

        <Text style={styles.title}>Editar Perfil</Text>

        <Text style={styles.subtitle}>
          Atualize suas informações cadastrais.
        </Text>

        <Text style={styles.sectionTitle}>
          Dados pessoais
        </Text>

        <Text style={styles.label}>Nome</Text>

        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          value={nome}
          onChangeText={setNome}
          editable={!carregando}
        />

        <Text style={styles.label}>E-mail</Text>

        <TextInput
          style={styles.input}
          placeholder="seuemail@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!carregando}
        />

        <Text style={styles.label}>Telefone</Text>

        <TextInput
          style={styles.input}
          placeholder="(00) 00000-0000"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
          editable={!carregando}
        />

        {ehDoador && (
          <>
            <Text style={styles.sectionTitle}>
              Dados da instituição
            </Text>

            <Text style={styles.label}>Razão social</Text>

            <TextInput
              style={styles.input}
              placeholder="Razão social"
              value={razaoSocial}
              onChangeText={setRazaoSocial}
              editable={!carregando}
            />

            <Text style={styles.label}>Nome fantasia</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome fantasia"
              value={nomeFantasia}
              onChangeText={setNomeFantasia}
              editable={!carregando}
            />

            <Text style={styles.label}>CNPJ</Text>

            <TextInput
              style={styles.input}
              placeholder="Informe o CNPJ"
              value={cnpj}
              onChangeText={setCnpj}
              keyboardType="numeric"
              editable={!carregando}
            />

            <Text style={styles.sectionTitle}>
              Endereço
            </Text>

            <Text style={styles.label}>
              Endereço da instituição
            </Text>

            <TextInput
              style={[styles.input, styles.addressInput]}
              placeholder="Rua, número, bairro, cidade..."
              value={endereco}
              onChangeText={setEndereco}
              multiline
              editable={!carregando}
            />
          </>
        )}

        <Pressable
          style={[
            styles.button,
            carregando && styles.buttonDisabled,
          ]}
          onPress={salvarPerfil}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              Salvar Alterações
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5F8F3',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8F3',
  },

  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },

  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#238447',
    textAlign: 'center',
    marginBottom: 24,
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#238447',
    marginTop: 12,
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DED4',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },

  addressInput: {
    minHeight: 85,
    textAlignVertical: 'top',
  },

  button: {
    backgroundColor: '#238447',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
