import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { excluir, listar } from '../services/api';

export interface DoadorItem {
  id: number;
  usuarioId: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco: string;
  usuario?: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
  };
}

function formatarCnpj(cnpj: string) {
  const limpo = (cnpj || '').replace(/\D/g, '');
  if (limpo.length !== 14) return cnpj || '-';
  return limpo.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

export default function GerenciarDoadoresView({ navigation, route }: any) {
  const dadosUsuario = route?.params || {};
  const token: string | undefined = dadosUsuario.token;

  const [doadores, setDoadores] = useState<DoadorItem[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  const carregarDoadores = useCallback(async () => {
    try {
      setCarregando(true);
      const lista = await listar<DoadorItem>('doadores', token);
      setDoadores(Array.isArray(lista) ? lista : []);
    } catch (error: any) {
      console.error('Erro ao carregar doadores:', error);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível carregar a lista de doadores.'
      );
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      carregarDoadores();
    }, [carregarDoadores])
  );

  function confirmarExclusao(doador: DoadorItem) {
    Alert.alert(
      'Excluir doador',
      `Deseja realmente excluir "${doador.nomeFantasia || doador.razaoSocial}"? Essa ação não poderá ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => executarExclusao(doador.id),
        },
      ]
    );
  }

  async function executarExclusao(id: number) {
    try {
      setExcluindoId(id);
      await excluir('doadores', id, token);
      setDoadores((atual) => atual.filter((item) => item.id !== id));
      Alert.alert('Sucesso', 'Doador excluído com sucesso.');
    } catch (error: any) {
      console.error('Erro ao excluir doador:', error);
      Alert.alert(
        'Erro ao excluir',
        error?.message ||
          'Não foi possível excluir o doador. Verifique se há doações vinculadas a ele.'
      );
    } finally {
      setExcluindoId(null);
    }
  }

  const doadoresFiltrados = doadores.filter((item) => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return true;

    return (
      (item.nomeFantasia || '').toLowerCase().includes(termo) ||
      (item.razaoSocial || '').toLowerCase().includes(termo) ||
      (item.cnpj || '').includes(termo.replace(/\D/g, '') || termo) ||
      (item.usuario?.nome || '').toLowerCase().includes(termo)
    );
  });

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Gerencie os comércios e doadores parceiros cadastrados.
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nome fantasia, razão social ou CNPJ..."
        value={busca}
        onChangeText={setBusca}
      />

      {carregando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#237A57" />
          <Text style={styles.loadingText}>Carregando doadores...</Text>
        </View>
      ) : (
        <FlatList
          data={doadoresFiltrados}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Nenhum doador encontrado</Text>
              <Text style={styles.emptyText}>
                {busca.trim()
                  ? 'Tente buscar por outro nome ou CNPJ.'
                  : 'Ainda não há comércios doadores cadastrados.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const estaExcluindo = excluindoId === item.id;

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>
                    {item.nomeFantasia || item.razaoSocial}
                  </Text>
                  <Text style={styles.badge}>ID #{item.id}</Text>
                </View>

                {!!item.razaoSocial &&
                  item.razaoSocial !== item.nomeFantasia && (
                    <Text style={styles.cardInfo}>
                      <Text style={styles.bold}>Razão social: </Text>
                      {item.razaoSocial}
                    </Text>
                  )}

                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>CNPJ: </Text>
                  {formatarCnpj(item.cnpj)}
                </Text>

                {!!item.usuario?.nome && (
                  <Text style={styles.cardInfo}>
                    <Text style={styles.bold}>Responsável: </Text>
                    {item.usuario.nome}
                    {item.usuario.telefone ? ` • ${item.usuario.telefone}` : ''}
                  </Text>
                )}

                {!!item.usuario?.email && (
                  <Text style={styles.cardInfo}>
                    <Text style={styles.bold}>E-mail: </Text>
                    {item.usuario.email}
                  </Text>
                )}

                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Endereço: </Text>
                  {item.endereco || 'Não informado'}
                </Text>

                <View style={styles.actionsRow}>
                  <Pressable
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() =>
                      navigation.navigate('EditarDoador', {
                        doador: item,
                        token,
                      })
                    }
                    disabled={estaExcluindo}
                  >
                    <Text style={styles.editBtnText}>✎ Editar</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.actionBtn,
                      styles.deleteBtn,
                      estaExcluindo && styles.disabledBtn,
                    ]}
                    onPress={() => confirmarExclusao(item)}
                    disabled={estaExcluindo}
                  >
                    {estaExcluindo ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.deleteBtnText}>🗑 Excluir</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8F3',
    padding: 16,
  },
  subtitle: {
    color: '#5C6B61',
    fontSize: 14,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DED4',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#5C6B61',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3EAE1',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F5E43',
    flex: 1,
  },
  badge: {
    backgroundColor: '#E8F3EC',
    color: '#237A57',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardInfo: {
    fontSize: 14,
    color: '#4A554E',
    marginBottom: 4,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: '#2C3530',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EC',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    backgroundColor: '#E8F3EC',
    borderWidth: 1,
    borderColor: '#237A57',
  },
  editBtnText: {
    color: '#237A57',
    fontWeight: '700',
    fontSize: 14,
  },
  deleteBtn: {
    backgroundColor: '#C44747',
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  disabledBtn: {
    opacity: 0.65,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E3EAE1',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3530',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B776F',
    textAlign: 'center',
  },
});