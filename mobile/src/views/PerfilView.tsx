
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { buscarPerfil, PerfilResponse } from '../services/api';

export default function PerfilView({ navigation, route }: any) {
  const token = route?.params?.token;

  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let telaAtiva = true;

      async function carregarPerfil() {
        try {
          if (!token) {
            Alert.alert(
              'Erro de autenticação',
              'Token não encontrado. Faça login novamente.'
            );
            return;
          }

          setCarregando(true);

          const dadosPerfil = await buscarPerfil(token);

          if (telaAtiva) {
            setPerfil(dadosPerfil);
          }
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);

          if (telaAtiva) {
            Alert.alert(
              'Erro',
              error instanceof Error
                ? error.message
                : 'Não foi possível carregar o perfil.'
            );
          }
        } finally {
          if (telaAtiva) {
            setCarregando(false);
          }
        }
      }

      carregarPerfil();

      return () => {
        telaAtiva = false;
      };
    }, [token])
  );

  const isAdmin = perfil?.tipoUsuario === 'ADMIN';

  const nome = isAdmin
    ? perfil?.nome || 'Administrador'
    : perfil?.doador?.nomeFantasia ||
      perfil?.doador?.razaoSocial ||
      perfil?.nome ||
      'Doador';

  const tipoUsuario = isAdmin
    ? 'Administrador'
    : 'Doador';

  const email = perfil?.email || 'Não informado';
  const telefone = perfil?.telefone || 'Não informado';

  const razaoSocial = perfil?.doador?.razaoSocial || 'Não informado';
  const documento = perfil?.doador?.cnpj || 'Não informado';
  const endereco = perfil?.doador?.endereco || 'Endereço não cadastrado';

  function exibir(valor: any) {
    if (!valor) {
      return 'Não informado';
    }

    return String(valor).trim() || 'Não informado';
  }

  function editarPerfil() {
    if (!perfil) return;

    navigation.navigate('EditarPerfil', {
      usuarioId: perfil.id,
      doadorId: perfil.doador?.id,
      tipoUsuario: perfil.tipoUsuario,

      nomeAtual: perfil.nome,
      nomeFantasiaAtual: perfil.doador?.nomeFantasia,
      razaoSocialAtual: perfil.doador?.razaoSocial,

      emailAtual: perfil.email,
      telefoneAtual: perfil.telefone,

      documentoAtual: perfil.doador?.cnpj,
      enderecoAtual: perfil.doador?.endereco,

      token,
    });
  }

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#237A57" />

        <Text style={styles.loadingText}>
          Carregando perfil...
        </Text>
      </View>
    );
  }

  if (!perfil) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Não foi possível carregar o perfil.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>
            Voltar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>
            {isAdmin ? '🛡️' : '🏪'}
          </Text>
        </View>

        <Text style={styles.title}>
          {nome}
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {tipoUsuario}
          </Text>
        </View>

        <Text style={styles.subtitle}>
          {isAdmin
            ? 'Gerencie as informações da sua conta administrativa.'
            : 'Gerencie as informações do seu estabelecimento.'}
        </Text>
      </View>

      {/* DADOS DO USUÁRIO */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>👤</Text>

          <Text style={styles.cardTitle}>
            Dados da conta
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>
          Nome
        </Text>

        <Text style={styles.value}>
          {exibir(perfil.nome)}
        </Text>

        <Text style={styles.label}>
          Tipo de conta
        </Text>

        <Text style={styles.value}>
          {tipoUsuario}
        </Text>
      </View>

      {/* DADOS DO DOADOR */}
      {!isAdmin && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🏪</Text>

            <Text style={styles.cardTitle}>
              Dados do estabelecimento
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>
            Nome fantasia
          </Text>

          <Text style={styles.value}>
            {exibir(perfil.doador?.nomeFantasia)}
          </Text>

          <Text style={styles.label}>
            Razão social
          </Text>

          <Text style={styles.value}>
            {exibir(razaoSocial)}
          </Text>

          <Text style={styles.label}>
            CNPJ
          </Text>

          <Text style={styles.value}>
            {exibir(documento)}
          </Text>
        </View>
      )}

      {/* CONTATO */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>✉️</Text>

          <Text style={styles.cardTitle}>
            Contato
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>
          E-mail
        </Text>

        <Text style={styles.value}>
          {exibir(email)}
        </Text>

        <Text style={styles.label}>
          Telefone
        </Text>

        <Text style={styles.value}>
          {exibir(telefone)}
        </Text>
      </View>

      {/* ENDEREÇO - SOMENTE DOADOR */}
      {!isAdmin && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📍</Text>

            <Text style={styles.cardTitle}>
              Endereço
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.value}>
            {exibir(endereco)}
          </Text>
        </View>
      )}

      {/* EDITAR PERFIL */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={editarPerfil}
      >
        <Text style={styles.buttonText}>
          ✎  Editar perfil
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Juntos, combatemos o desperdício de alimentos. 💚
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F5',
  },

  content: {
    padding: 20,
    paddingBottom: 35,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9F5',
    padding: 20,
  },

  loadingText: {
    color: '#66736A',
    marginTop: 12,
    textAlign: 'center',
  },

  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
  },

  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6F3E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatar: {
    fontSize: 48,
  },

  title: {
    fontSize: 23,
    fontWeight: '800',
    color: '#237A57',
    marginTop: 14,
    textAlign: 'center',
  },

  badge: {
    backgroundColor: '#E6F3E9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 9,
  },

  badgeText: {
    color: '#237A57',
    fontSize: 12,
    fontWeight: '700',
  },

  subtitle: {
    color: '#66736A',
    marginTop: 10,
    fontSize: 13,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 19,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7ECE5',
    marginBottom: 15,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardIcon: {
    fontSize: 19,
    marginRight: 10,
  },

  cardTitle: {
    color: '#237A57',
    fontSize: 16,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#E7ECE5',
    marginBottom: 10,
  },

  label: {
    color: '#788279',
    fontSize: 12,
    marginTop: 12,
  },

  value: {
    color: '#26372D',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 5,
    lineHeight: 22,
  },

  button: {
    backgroundColor: '#237A57',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 7,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  footer: {
    textAlign: 'center',
    color: '#66736A',
    marginTop: 25,
    lineHeight: 20,
    fontSize: 12,
  },
});
