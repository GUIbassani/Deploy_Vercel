import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  cadastrar as cadastrarAPI,
  consultarCEP,
} from '../services/api';

export default function CadastroComercioView({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);

  function formatarCEP(valor: string) {
    const numeros = valor.replace(/\D/g, '').slice(0, 8);

    if (numeros.length > 5) {
      return numeros.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
    }

    return numeros;
  }

  async function buscarCEP() {
    if (!cep.trim()) {
      Alert.alert('Atenção', 'Informe o CEP.');
      return;
    }

    try {
      setBuscandoCEP(true);

      const dados = await consultarCEP(cep);

      const enderecoCompleto = [
        dados.rua,
        dados.bairro,
        dados.cidade,
        dados.estado,
      ]
        .filter(Boolean)
        .join(', ');

      if (!enderecoCompleto) {
        Alert.alert(
          'Atenção',
          'Não foi possível montar o endereço a partir deste CEP.'
        );
        return;
      }

      setEndereco(enderecoCompleto);

      Alert.alert(
        'Sucesso',
        'Endereço preenchido com sucesso!'
      );
    } catch (error: any) {
      Alert.alert(
        'Erro ao consultar CEP',
        error?.message ||
          'Não foi possível localizar o CEP informado.'
      );
    } finally {
      setBuscandoCEP(false);
    }
  }

  async function cadastrar() {
    if (
      !nome.trim() ||
      !responsavel.trim() ||
      !cnpj.trim() ||
      !email.trim() ||
      !telefone.trim() ||
      !endereco.trim() ||
      !senha.trim()
    ) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (carregando) return;

    try {
      setCarregando(true);

      const emailNormalizado = email.trim().toLowerCase();
      const cnpjNormalizado = cnpj.replace(/\D/g, '');
      const nomeEstabelecimento = nome.trim();

      await cadastrarAPI('usuarios', {
        nome: responsavel.trim(),
        email: emailNormalizado,
        senha: senha,
        telefone: telefone.trim(),
        razaoSocial: nomeEstabelecimento,
        nomeFantasia: nomeEstabelecimento,
        cnpj: cnpjNormalizado,
        endereco: endereco.trim(),
      });

      Alert.alert(
        'Cadastro realizado',
        'Seu comércio foi cadastrado com sucesso! Faça login para continuar.',
        [
          {
            text: 'Ir para login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Erro ao cadastrar comércio:', error);

      Alert.alert(
        'Erro no cadastro',
        error?.message ||
          'Não foi possível concluir o cadastro. Verifique a conexão com o servidor e tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Cadastro do comércio</Text>

      <Text style={styles.subtitle}>
        Faça seu cadastro para registrar doações ao AlimentaTodos.
      </Text>

      <Text style={styles.label}>Nome do estabelecimento</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome do estabelecimento"
        value={nome}
        onChangeText={setNome}
        editable={!carregando}
      />

      <Text style={styles.label}>Nome do responsável</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome do responsável"
        value={responsavel}
        onChangeText={setResponsavel}
        editable={!carregando}
      />

      <Text style={styles.label}>CNPJ</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o CNPJ"
        value={cnpj}
        onChangeText={setCnpj}
        keyboardType="numeric"
        editable={!carregando}
      />

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o e-mail"
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
        placeholder="Digite o telefone"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
        editable={!carregando}
      />

      {/* CEP */}
      <Text style={styles.label}>CEP</Text>

      <View style={styles.linhaCEP}>
        <TextInput
          style={styles.inputCEP}
          placeholder="00000-000"
          value={cep}
          onChangeText={(valor) => setCep(formatarCEP(valor))}
          keyboardType="numeric"
          maxLength={9}
          editable={!carregando && !buscandoCEP}
        />

        <Pressable
          style={[
            styles.botaoCEP,
            (buscandoCEP || carregando) && styles.buttonDisabled,
          ]}
          onPress={buscarCEP}
          disabled={buscandoCEP || carregando}
        >
          {buscandoCEP ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBotaoCEP}>
              Buscar CEP
            </Text>
          )}
        </Pressable>
      </View>

      {/* Endereço */}
      <Text style={styles.label}>Endereço do estabelecimento</Text>
      <TextInput
        style={[styles.input, styles.inputEndereco]}
        placeholder="Digite ou consulte o endereço pelo CEP"
        value={endereco}
        onChangeText={setEndereco}
        multiline
        editable={!carregando}
      />

      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Crie uma senha"
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
        onPress={cadastrar}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            Cadastrar comércio
          </Text>
        )}
      </Pressable>

      <Pressable
        style={styles.linkButton}
        onPress={() => navigation.navigate('Login')}
        disabled={carregando}
      >
        <Text style={styles.linkText}>Já tenho uma conta</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#F5F8F3',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#238447',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 24,
    lineHeight: 21,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
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
  linhaCEP: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  inputCEP: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DED4',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  botaoCEP: {
    backgroundColor: '#238447',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 115,
  },
  textoBotaoCEP: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  inputEndereco: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#238447',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    padding: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#238447',
  },
});