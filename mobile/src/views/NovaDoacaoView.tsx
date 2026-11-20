
import { useState } from 'react';
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

import { cadastrar } from '../services/api';

export default function NovaDoacaoView({ route, navigation }: any) {
  const {
    nomeComercio,
    token,
  } = route?.params || {};

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [validade, setValidade] = useState('');
  const [carregando, setCarregando] = useState(false);

  function converterData(data: string): string | null {
    const partes = data.trim().split('/');

    if (partes.length !== 3) {
      return null;
    }

    const [dia, mes, ano] = partes;

    if (
      !dia ||
      !mes ||
      !ano ||
      dia.length !== 2 ||
      mes.length !== 2 ||
      ano.length !== 4
    ) {
      return null;
    }

    const diaNumero = Number(dia);
    const mesNumero = Number(mes);
    const anoNumero = Number(ano);

    const dataValidada = new Date(
      anoNumero,
      mesNumero - 1,
      diaNumero
    );

    if (
      dataValidada.getDate() !== diaNumero ||
      dataValidada.getMonth() !== mesNumero - 1 ||
      dataValidada.getFullYear() !== anoNumero
    ) {
      return null;
    }

    return dataValidada.toISOString();
  }

  async function salvarDoacao() {
    if (
      !titulo.trim() ||
      !quantidade.trim() ||
      !validade.trim()
    ) {
      Alert.alert(
        'Atenção',
        'Preencha o título, a quantidade e a validade do alimento.'
      );
      return;
    }

    if (!token) {
      Alert.alert(
        'Erro',
        'Token de autenticação não encontrado. Faça login novamente.'
      );
      return;
    }

    const dataValidade = converterData(validade);

    if (!dataValidade) {
      Alert.alert(
        'Atenção',
        'Informe uma data de validade válida no formato DD/MM/AAAA.'
      );
      return;
    }

    if (carregando) return;

    try {
      setCarregando(true);

      const novaDoacao = {
        dataValidade,
        observacoes: [
          `Alimento: ${titulo.trim()}`,
          `Quantidade: ${quantidade.trim()}`,
          descricao.trim()
            ? `Descrição: ${descricao.trim()}`
            : '',
        ]
          .filter(Boolean)
          .join('\n'),
      };

      await cadastrar('doacoes', novaDoacao, token);

      Alert.alert(
        'Sucesso',
        'Doação cadastrada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error: any) {
      console.error('Erro ao cadastrar doação:', error);

      Alert.alert(
        'Erro',
        error?.message ||
          'Não foi possível cadastrar a doação. Verifique a conexão com o servidor.'
      );

    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Text style={styles.logo}>AlimentaTodos</Text>

        <Text style={styles.title}>Nova Doação</Text>

        <Text style={styles.subtitle}>
          {nomeComercio
            ? `Cadastrando para ${nomeComercio}`
            : 'Informe os detalhes do alimento a ser doado.'}
        </Text>

        <Text style={styles.label}>Título do alimento</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Pães variados"
          value={titulo}
          onChangeText={setTitulo}
          editable={!carregando}
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva as condições do alimento"
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          editable={!carregando}
        />

        <Text style={styles.label}>Quantidade</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 5 kg, 10 pacotes"
          value={quantidade}
          onChangeText={setQuantidade}
          editable={!carregando}
        />

        <Text style={styles.label}>Validade</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 20/12/2026"
          value={validade}
          onChangeText={setValidade}
          editable={!carregando}
        />

        <Pressable
          style={[
            styles.button,
            carregando && styles.buttonDisabled,
          ]}
          onPress={salvarDoacao}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              Cadastrar Doação
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
    marginBottom: 14,
    fontSize: 16,
  },
  textArea: {
    height: 90,
  },
  button: {
    backgroundColor: '#238447',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
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
