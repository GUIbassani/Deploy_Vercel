
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { listar, patch, excluir } from '../services/api';

type StatusDoacao =
  | 'PENDENTE'
  | 'ENCAMINHADA'
  | 'ENTREGUE'
  | 'CANCELADA';

interface Doacao {
  id: number;
  doadorId: number;
  doador?: {
    nomeFantasia?: string;
    razaoSocial?: string;
    nome?: string;
  };
  dataDoacao?: string;
  dataValidade?: string;
  status: StatusDoacao;
  observacoes?: string;
}

const filtros = [
  'TODAS',
  'PENDENTE',
  'ENCAMINHADA',
  'ENTREGUE',
  'CANCELADA',
];

const statusDisponiveis: StatusDoacao[] = [
  'PENDENTE',
  'ENCAMINHADA',
  'ENTREGUE',
  'CANCELADA',
];

export default function GerenciarDoacoesView({ route }: any) {
  const token = route?.params?.token;

  const [filtroSelecionado, setFiltroSelecionado] = useState('TODAS');
  const [atualizando, setAtualizando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const [doacoes, setDoacoes] = useState<Doacao[]>([]);

  useEffect(() => {
    carregarDoacoes();
  }, []);

  const doacoesFiltradas =
    filtroSelecionado === 'TODAS'
      ? doacoes
      : doacoes.filter(
          (doacao) => doacao.status === filtroSelecionado,
        );

  async function carregarDoacoes() {
    try {
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      const resposta = await listar<Doacao>('doacoes', token);

      setDoacoes(resposta);
    } catch (error: any) {
      console.error('Erro ao carregar doações:', error);

      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível carregar as doações.',
      );
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  async function atualizarLista() {
    setAtualizando(true);
    await carregarDoacoes();
  }

  function formatarData(data?: string) {
    if (!data) return 'Não informada';

    const dataFormatada = new Date(data);

    if (isNaN(dataFormatada.getTime())) {
      return 'Não informada';
    }

    return dataFormatada.toLocaleDateString('pt-BR');
  }

  function obterCorStatus(status: StatusDoacao) {
    switch (status) {
      case 'PENDENTE':
        return {
          backgroundColor: '#FFF3CD',
          color: '#856404',
        };

      case 'ENCAMINHADA':
        return {
          backgroundColor: '#D1ECF1',
          color: '#0C5460',
        };

      case 'ENTREGUE':
        return {
          backgroundColor: '#D4EDDA',
          color: '#155724',
        };

      case 'CANCELADA':
        return {
          backgroundColor: '#F8D7DA',
          color: '#721C24',
        };

      default:
        return {
          backgroundColor: '#E7ECE5',
          color: '#526157',
        };
    }
  }

  async function salvarNovoStatus(
    doacao: Doacao,
    novoStatus: StatusDoacao,
  ) {
    if (novoStatus === doacao.status) {
      return;
    }

    try {
      await patch(
        'doacoes',
        doacao.id,
        { status: novoStatus },
        token,
      );

      setDoacoes((listaAtual) =>
        listaAtual.map((item) =>
          item.id === doacao.id
            ? { ...item, status: novoStatus }
            : item,
        ),
      );

      Alert.alert(
        'Sucesso',
        `Status da doação #${doacao.id} atualizado para ${novoStatus}.`,
      );
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);

      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível alterar o status da doação.',
      );
    }
  }

  function alterarStatus(doacao: Doacao) {
    Alert.alert(
      'Alterar status',
      `Selecione o novo status da doação #${doacao.id}`,
      [
        ...statusDisponiveis.map((status) => ({
          text: status,
          onPress: () => salvarNovoStatus(doacao, status),
        })),
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
    );
  }

  async function confirmarExclusao(doacao: Doacao) {
    try {
      await excluir('doacoes', doacao.id, token);

      setDoacoes((listaAtual) =>
        listaAtual.filter((item) => item.id !== doacao.id),
      );

      Alert.alert(
        'Sucesso',
        `Doação #${doacao.id} excluída com sucesso.`,
      );
    } catch (error: any) {
      console.error('Erro ao excluir doação:', error);

      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível excluir a doação.',
      );
    }
  }

  function excluirDoacao(doacao: Doacao) {
    Alert.alert(
      'Excluir doação',
      `Tem certeza que deseja excluir a doação #${doacao.id}? Esta ação não poderá ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => confirmarExclusao(doacao),
        },
      ],
    );
  }

  function renderDoacao({ item }: { item: Doacao }) {
    const statusStyle = obterCorStatus(item.status);

    const nomeComercio =
      item.doador?.nomeFantasia ||
      item.doador?.razaoSocial ||
      item.doador?.nome ||
      'Comércio doador';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>
              {nomeComercio}
            </Text>

            <Text style={styles.cardSubtitle}>
              Doação #{item.id}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusStyle.backgroundColor },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusStyle.color },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Data da doação</Text>
          <Text style={styles.infoValue}>
            {formatarData(item.dataDoacao)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Validade</Text>
          <Text style={styles.infoValue}>
            {formatarData(item.dataValidade)}
          </Text>
        </View>

        {item.observacoes ? (
          <View style={styles.observacoesContainer}>
            <Text style={styles.infoLabel}>Observações</Text>
            <Text style={styles.observacoes}>
              {item.observacoes}
            </Text>
          </View>
        ) : null}

        <View style={styles.acoesContainer}>
          <Pressable
            style={styles.botaoStatus}
            onPress={() => alterarStatus(item)}
          >
            <Text style={styles.botaoStatusTexto}>
              Alterar status
            </Text>
          </Pressable>

          <Pressable
            style={styles.botaoExcluir}
            onPress={() => excluirDoacao(item)}
          >
            <Text style={styles.botaoExcluirTexto}>
              Excluir
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Gerenciar doações</Text>

        <Text style={styles.subtitulo}>
          Acompanhe e gerencie todas as doações do sistema.
        </Text>
      </View>

      <View style={styles.resumo}>
        <Text style={styles.resumoLabel}>
          Total de doações
        </Text>

        <Text style={styles.resumoValor}>
          {doacoes.length}
        </Text>
      </View>

      <View style={styles.filtrosContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filtros}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const selecionado = filtroSelecionado === item;

            return (
              <Pressable
                style={[
                  styles.filtro,
                  selecionado && styles.filtroSelecionado,
                ]}
                onPress={() => setFiltroSelecionado(item)}
              >
                <Text
                  style={[
                    styles.filtroTexto,
                    selecionado && styles.filtroTextoSelecionado,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {carregando ? (
        <View style={styles.carregandoContainer}>
          <ActivityIndicator size="large" color="#237A57" />

          <Text style={styles.carregandoTexto}>
            Carregando doações...
          </Text>
        </View>
      ) : (
        <FlatList
          data={doacoesFiltradas}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderDoacao}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={atualizarLista}
              colors={['#237A57']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>

              <Text style={styles.emptyTitle}>
                Nenhuma doação encontrada
              </Text>

              <Text style={styles.emptyText}>
                {filtroSelecionado === 'TODAS'
                  ? 'Ainda não existem doações cadastradas.'
                  : `Não existem doações com status ${filtroSelecionado}.`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F4',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },

  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#26372D',
  },

  subtitulo: {
    fontSize: 13,
    color: '#7A897F',
    marginTop: 6,
  },

  resumo: {
    backgroundColor: '#237A57',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
  },

  resumoLabel: {
    color: '#E5F4E9',
    fontSize: 13,
    fontWeight: '600',
  },

  resumoValor: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 5,
  },

  filtrosContainer: {
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  filtro: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E1E8E1',
  },

  filtroSelecionado: {
    backgroundColor: '#237A57',
    borderColor: '#237A57',
  },

  filtroTexto: {
    color: '#526157',
    fontSize: 12,
    fontWeight: '600',
  },

  filtroTextoSelecionado: {
    color: '#FFFFFF',
  },

  lista: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    flexGrow: 1,
  },

  carregandoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  carregandoTexto: {
    color: '#526157',
    fontSize: 14,
    marginTop: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7ECE5',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26372D',
  },

  cardSubtitle: {
    fontSize: 12,
    color: '#8A968D',
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#E7ECE5',
    marginVertical: 14,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  infoLabel: {
    color: '#7A897F',
    fontSize: 12,
  },

  infoValue: {
    color: '#26372D',
    fontSize: 12,
    fontWeight: '600',
  },

  observacoesContainer: {
    marginTop: 5,
  },

  observacoes: {
    color: '#526157',
    fontSize: 13,
    marginTop: 5,
    lineHeight: 19,
  },

  acoesContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  botaoStatus: {
    flex: 1,
    backgroundColor: '#237A57',
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
  },

  botaoStatusTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  botaoExcluir: {
    flex: 1,
    backgroundColor: '#FCE8E8',
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3C6C6',
  },

  botaoExcluirTexto: {
    color: '#C44747',
    fontSize: 12,
    fontWeight: '700',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#526157',
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 13,
    color: '#8A968D',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
