
import { useNavigation } from '@react-navigation/native';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeView({ route }: any) {
  const navigation = useNavigation<any>();
  const dadosUsuario = route?.params || {};
  const isAdmin = dadosUsuario.tipoUsuario === 'ADMIN';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>🌱 AlimentaTodos</Text>
        <Text style={styles.subtitle}>
          {isAdmin
            ? 'Painel administrativo'
            : 'Painel do comércio parceiro'}
        </Text>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>
          {isAdmin
            ? 'Gestão da plataforma AlimentaTodos'
            : 'Sua doação transforma vidas!'}
        </Text>

        <Text style={styles.bannerText}>
          {isAdmin
            ? 'Gerencie os doadores parceiros e acompanhe todas as doações da plataforma.'
            : 'Compartilhe alimentos excedentes e ajude a combater o desperdício.'}
        </Text>
      </View>

      {isAdmin ? (
        <>
          <Text style={styles.sectionTitle}>
            Área do administrador
          </Text>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('GerenciarDoacoes', dadosUsuario)
            }
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>☷</Text>
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>
                Gerenciar doações
              </Text>
              <Text style={styles.cardDescription}>
                Acompanhe e gerencie todas as doações registradas.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('GerenciarDoadores', dadosUsuario)
            }
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👥</Text>
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>
                Gerenciar doadores
              </Text>
              <Text style={styles.cardDescription}>
                Consulte, edite ou exclua comércios parceiros cadastrados.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>
            Área do doador
          </Text>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('Nova doação', dadosUsuario)
            }
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>＋</Text>
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>
                Registrar nova doação
              </Text>
              <Text style={styles.cardDescription}>
                Informe os alimentos disponíveis para doar.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('Minhas doações', dadosUsuario)
            }
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>☷</Text>
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>
                Minhas doações
              </Text>
              <Text style={styles.cardDescription}>
                Consulte suas doações e acompanhe as entregas.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>
              Como funciona?
            </Text>

            <Text style={styles.infoText}>
              1. Cadastre os alimentos excedentes próprios para consumo.
            </Text>

            <Text style={styles.infoText}>
              2. Aguarde as orientações para realizar a entrega.
            </Text>

            <Text style={styles.infoText}>
              3. Acompanhe o andamento da sua doação pelo aplicativo.
            </Text>
          </View>
        </>
      )}
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
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  logo: {
    fontSize: 27,
    fontWeight: '800',
    color: '#237A57',
  },
  subtitle: {
    marginTop: 5,
    color: '#66736A',
    fontSize: 14,
  },
  banner: {
    backgroundColor: '#237A57',
    padding: 22,
    borderRadius: 18,
    marginBottom: 28,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 31,
  },
  bannerText: {
    color: '#E5F4E9',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#24352B',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 14,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7ECE5',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#E6F3E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  icon: {
    fontSize: 24,
    color: '#237A57',
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: '#26372D',
    fontSize: 15,
    fontWeight: '800',
  },
  cardDescription: {
    color: '#68746B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  arrow: {
    fontSize: 25,
    color: '#237A57',
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E7ECE5',
  },
  infoTitle: {
    color: '#24352B',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  infoText: {
    color: '#68746B',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 9,
  },
});
