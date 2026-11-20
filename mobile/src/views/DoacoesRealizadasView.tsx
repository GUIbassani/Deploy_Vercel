
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { listar } from '../services/api';

export default function DoacoesRealizadasView({ route }: any) {
  const { token } = route?.params || {};

  const [doacoes, setDoacoes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(false);

  const carregarDoacoes = useCallback(async () => {
    if (!token) {
      setDoacoes([]);
      setErro(true);
      setCarregando(false);
      setAtualizando(false);
      return;
    }

    try {
      setErro(false);

      const registros = await listar('doacoes', token);

      const minhasDoacoes = registros.sort(
        (a: any, b: any) =>
          new Date(b.createdAt || b.dataCriacao || 0).getTime() -
          new Date(a.createdAt || a.dataCriacao || 0).getTime()
      );

      setDoacoes(minhasDoacoes);

    } catch (error) {
      console.error('Erro ao carregar doações:', error);
      setErro(true);

    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setCarregando(true);
      carregarDoacoes();
    }, [carregarDoacoes])
  );

  function formatarData(data: string) {
    if (!data) return 'Não informada';

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
      return data;
    }

    const dataFormatada = new Date(data);

    if (isNaN(dataFormatada.getTime())) {
      return data;
    }

    return dataFormatada.toLocaleDateString('pt-BR');
  }

  function atualizarLista() {
    setAtualizando(true);
    carregarDoacoes();
  }

  function renderizarDoacao({ item }: any) {
    const dataCadastro = item.createdAt || item.dataCriacao;
    const observacoes = item.observacoes || '';

    return (
      <View style={styles.card}>
        <Text style={styles.alimento}>
          Doação #{item.id}
        </Text>

        {observacoes ? (
          <Text style={styles.descricao}>
            {observacoes}
          </Text>
        ) : (
          <Text style={styles.descricao}>
            Nenhuma observação informada.
          </Text>
        )}

        <Text style={styles.info}>
          Validade: {formatarData(item.dataValidade)}
        </Text>

        <Text style={styles.info}>
          Data do cadastro: {formatarData(dataCadastro)}
        </Text>

        <View style={styles.statusContainer}>
          <Text style={styles.status}>
            {item.status || 'PENDENTE'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas doações</Text>

      <Text style={styles.subtitle}>
        Acompanhe as doações registradas pelo seu comércio.
      </Text>

      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#238447" />
          <Text style={styles.loadingText}>
            Carregando doações...
          </Text>
        </View>
      ) : erro ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Não foi possível carregar suas doações.
          </Text>
          <Text style={styles.emptySubtext}>
            Verifique a conexão com o servidor e tente novamente.
          </Text>
        </View>
      ) : (
        <FlatList
          data={doacoes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={renderizarDoacao}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={atualizarLista}
              colors={['#238447']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhuma doação cadastrada.
              </Text>
              <Text style={styles.emptySubtext}>
                Suas novas doações aparecerão aqui.
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
    backgroundColor: '#F5F8F3',
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#238447',
  },
  subtitle: {
    color: '#666',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 21,
  },
  list: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DDE8DC',
  },
  alimento: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#26372D',
  },
  descricao: {
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  info: {
    color: '#555',
    marginBottom: 5,
  },
  statusContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F3E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  status: {
    color: '#238447',
    fontWeight: 'bold',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#555',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
});
