import { useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { API_URL, consultarCEP } from '../services/api';

interface Instituicao {
  id: number;
  nome: string;
  tipo: string;
  endereco?: string;
  telefone?: string;
}

export default function CadastroInstituicaoView() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { token, tipoUsuario } = route.params || {};

  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);

  useEffect(() => {
    if (tipoUsuario !== 'ADMIN') {
      Alert.alert(
        'Acesso negado',
        'Somente administradores podem acessar esta área.',
        [{ text: 'Voltar', onPress: () => navigation.goBack() }],
      );

      return;
    }

    carregarInstituicoes();
  }, []);

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
          'Não foi possível montar o endereço a partir deste CEP.',
        );
        return;
      }

      setEndereco(enderecoCompleto);

      Alert.alert('Sucesso', 'Endereço preenchido com sucesso!');
    } catch (error: any) {
      Alert.alert(
        'Erro ao consultar CEP',
        error.message || 'Não foi possível localizar o CEP informado.',
      );
    } finally {
      setBuscandoCEP(false);
    }
  }

  async function carregarInstituicoes() {
    try {
      setCarregando(true);

      const resposta = await fetch(`${API_URL}/instituicoes`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || 'Erro ao buscar instituições.');
      }

      setInstituicoes(dados);
    } catch (error: any) {
      console.error('Erro ao carregar instituições:', error);

      Alert.alert(
        'Erro',
        error.message || 'Não foi possível carregar as instituições.',
      );
    } finally {
      setCarregando(false);
    }
  }

  function limparFormulario() {
    setNome('');
    setTipo('');
    setCep('');
    setEndereco('');
    setTelefone('');
    setEditandoId(null);
  }

  async function salvarInstituicao() {
    if (!nome.trim() || !tipo.trim()) {
      Alert.alert('Atenção', 'Informe o nome e o tipo da instituição.');
      return;
    }

    const dados = {
      nome: nome.trim(),
      tipo: tipo.trim(),
      endereco: endereco.trim(),
      telefone: telefone.trim(),
    };

    try {
      setSalvando(true);

      const url = editandoId
        ? `${API_URL}/instituicoes/${editandoId}`
        : `${API_URL}/instituicoes`;

      const resposta = await fetch(url, {
        method: editandoId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          resultado.mensagem || 'Não foi possível salvar a instituição.',
        );
      }

      Alert.alert(
        'Sucesso',
        editandoId
          ? 'Instituição atualizada!'
          : 'Instituição cadastrada!',
      );

      limparFormulario();
      carregarInstituicoes();
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.message || 'Erro ao salvar instituição.',
      );
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicao(instituicao: Instituicao) {
    setEditandoId(instituicao.id);
    setNome(instituicao.nome);
    setTipo(instituicao.tipo);
    setEndereco(instituicao.endereco || '');
    setTelefone(instituicao.telefone || '');
    setCep('');
  }

  function confirmarExclusao(id: number) {
    Alert.alert(
      'Excluir instituição',
      'Deseja realmente excluir esta instituição?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => excluirInstituicao(id),
        },
      ],
    );
  }

  async function excluirInstituicao(id: number) {
    try {
      const resposta = await fetch(`${API_URL}/instituicoes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || 'Erro ao excluir instituição.');
      }

      Alert.alert('Sucesso', 'Instituição excluída.');

      carregarInstituicoes();
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível excluir a instituição.',
      );
    }
  }

  if (tipoUsuario !== 'ADMIN') {
    return (
      <View style={styles.container}>
        <Text style={styles.erro}>
          Acesso permitido somente para administradores.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Instituições</Text>

      <View style={styles.formulario}>
        <Text style={styles.subtitulo}>
          {editandoId ? 'Editar instituição' : 'Cadastrar instituição'}
        </Text>

        {/* Nome */}
        <Text style={styles.label}>Nome da instituição</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome da instituição"
          value={nome}
          onChangeText={setNome}
        />

        {/* Tipo */}
        <Text style={styles.label}>Tipo de instituição</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: ONG, abrigo, associação"
          value={tipo}
          onChangeText={setTipo}
        />

        {/* CEP */}
        <Text style={styles.label}>CEP</Text>
        <View style={styles.linhaCEP}>
          <TextInput
            style={styles.inputCEP}
            placeholder="Digite o CEP"
            value={cep}
            onChangeText={(texto) =>
              setCep(texto.replace(/\D/g, '').slice(0, 8))
            }
            keyboardType="numeric"
            maxLength={8}
          />

          <TouchableOpacity
            style={[
              styles.botaoCEP,
              buscandoCEP && styles.botaoDesabilitado,
            ]}
            onPress={buscarCEP}
            disabled={buscandoCEP}
          >
            {buscandoCEP ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botaoTexto}>Buscar CEP</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Endereço */}
        <Text style={styles.label}>Endereço completo</Text>
        <TextInput
          style={[styles.input, styles.inputEndereco]}
          placeholder="Rua, bairro, cidade e estado"
          value={endereco}
          onChangeText={setEndereco}
          multiline
        />

        {/* Telefone */}
        <Text style={styles.label}>Telefone de contato</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o telefone"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={styles.botaoSalvar}
          onPress={salvarInstituicao}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botaoTexto}>
              {editandoId
                ? 'Atualizar instituição'
                : 'Cadastrar instituição'}
            </Text>
          )}
        </TouchableOpacity>

        {editandoId !== null && (
          <TouchableOpacity
            style={styles.botaoCancelar}
            onPress={limparFormulario}
          >
            <Text style={styles.botaoCancelarTexto}>Cancelar edição</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtituloLista}>
        Instituições cadastradas
      </Text>

      {carregando ? (
        <ActivityIndicator size="large" color="#237A57" />
      ) : (
        <FlatList
          data={instituicoes}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={styles.vazio}>
              Nenhuma instituição cadastrada.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>{item.nome}</Text>

              <Text style={styles.cardTexto}>
                Tipo: {item.tipo}
              </Text>

              <Text style={styles.cardTexto}>
                📍 {item.endereco || 'Endereço não informado'}
              </Text>

              <Text style={styles.cardTexto}>
                ☎ {item.telefone || 'Telefone não informado'}
              </Text>

              <View style={styles.acoes}>
                <TouchableOpacity
                  style={styles.botaoEditar}
                  onPress={() => iniciarEdicao(item)}
                >
                  <Text style={styles.botaoTexto}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoExcluir}
                  onPress={() => confirmarExclusao(item.id)}
                >
                  <Text style={styles.botaoTexto}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F5',
    padding: 20,
  },
  titulo: {
    fontSize: 25,
    fontWeight: '800',
    color: '#24352B',
    marginBottom: 20,
  },
  subtitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#24352B',
    marginBottom: 12,
  },
  formulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E7ECE5',
  },

  // Identificação dos campos
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#24352B',
    marginBottom: 6,
    marginTop: 4,
  },

  input: {
    backgroundColor: '#F7F9F5',
    borderWidth: 1,
    borderColor: '#E1E8E1',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 10,
    color: '#26372D',
  },

  // Campo CEP
  linhaCEP: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  inputCEP: {
    flex: 1,
    backgroundColor: '#F7F9F5',
    borderWidth: 1,
    borderColor: '#E1E8E1',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: '#26372D',
  },
  botaoCEP: {
    backgroundColor: '#237A57',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 105,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  inputEndereco: {
    minHeight: 70,
    textAlignVertical: 'top',
  },

  // Botões
  botaoSalvar: {
    backgroundColor: '#237A57',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  botaoCancelar: {
    padding: 12,
    alignItems: 'center',
  },
  botaoCancelarTexto: {
    color: '#68756C',
    fontWeight: '600',
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Lista
  subtituloLista: {
    fontSize: 18,
    fontWeight: '700',
    color: '#24352B',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7ECE5',
  },
  cardTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: '#237A57',
    marginBottom: 8,
  },
  cardTexto: {
    fontSize: 14,
    color: '#59665D',
    marginBottom: 5,
  },
  acoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  botaoEditar: {
    flex: 1,
    backgroundColor: '#237A57',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoExcluir: {
    flex: 1,
    backgroundColor: '#C44747',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  vazio: {
    textAlign: 'center',
    color: '#77837A',
    padding: 20,
  },
  erro: {
    color: '#C44747',
    fontSize: 16,
    textAlign: 'center',
  },
});