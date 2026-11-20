import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
} from 'react-native';

import { atualizarParcial } from '../services/api';
import { DoadorItem } from './GerenciarDoadoresView';

export default function EditarDoadorView({ navigation, route }: any) {
  const doador: DoadorItem = route?.params?.doador;
  const token: string | undefined = route?.params?.token;

  const [nomeFantasia, setNomeFantasia] = useState(doador?.nomeFantasia || '');
  const [razaoSocial, setRazaoSocial] = useState(doador?.razaoSocial || '');
  const [cnpj, setCnpj] = useState(doador?.cnpj || '');
  const [endereco, setEndereco] = useState(doador?.endereco || '');
  const [salvando, setSalvando] = useState(false);

  async function salvarAlteracoes() {
    if (
      !nomeFantasia.trim() ||
      !razaoSocial.trim() ||
      !cnpj.trim() ||
      !endereco.trim()
    ) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) {
      Alert.alert('CNPJ inválido', 'O CNPJ deve conter 14 dígitos numéricos.');
      return;
    }

    if (salvando) return;

    try {
      setSalvando(true);

      await atualizarParcial(
        'doadores',
        doador.id,
        {
          nomeFantasia: nomeFantasia.trim(),
          razaoSocial: razaoSocial.trim(),
          cnpj: cnpjLimpo,
          endereco: endereco.trim(),
        },
        token
      );

      Alert.alert('Sucesso', 'Dados do doador atualizados com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Erro ao atualizar doador:', error);
      Alert.alert(
        'Erro ao salvar',
        error?.message || 'Não foi possível atualizar os dados do doador.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Editar doador #{doador?.id}</Text>
      <Text style={styles.subtitle}>
        Atualize as informações cadastrais do comércio parceiro.
      </Text>

      <Text style={styles.label}>Nome fantasia</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome fantasia"
        value={nomeFantasia}
        onChangeText={setNomeFantasia}
        editable={!salvando}
      />

      <Text style={styles.label}>Razão social</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a razão social"
        value={razaoSocial}
        onChangeText={setRazaoSocial}
        editable={!salvando}
      />

      <Text style={styles.label}>CNPJ (apenas números)</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite os 14 dígitos do CNPJ"
        value={cnpj}
        onChangeText={setCnpj}
        keyboardType="numeric"
        maxLength={18}
        editable={!salvando}
      />

      <Text style={styles.label}>Endereço</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o endereço completo"
        value={endereco}
        onChangeText={setEndereco}
        editable={!salvando}
      />

      <Pressable
        style={[styles.button, salvando && styles.buttonDisabled]}
        onPress={salvarAlteracoes}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Salvar alterações</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
        disabled={salvando}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#237A57',
    marginBottom: 6,
  },
  subtitle: {
    color: '#666',
    marginBottom: 22,
    lineHeight: 20,
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
  button: {
    backgroundColor: '#237A57',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },
});