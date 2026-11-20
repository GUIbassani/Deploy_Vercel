import sequelize from "../lib/db";

import { Usuario, initUsuario } from "./Usuario";
import { Doador, initDoador } from "./Doador";
import { Doacao, initDoacao } from "./Doacao";
import { Instituicao, initInstituicao } from "./Instituicao";
import { Distribuicao, initDistribuicao } from "./Distribuicao";

import bcrypt from "bcryptjs";

initUsuario(sequelize);
initDoador(sequelize);
initDoacao(sequelize);
initInstituicao(sequelize);
initDistribuicao(sequelize);

Usuario.hasOne(Doador, {
    foreignKey: "usuarioId",
    as: "doador",
});

Doador.belongsTo(Usuario, {
    foreignKey: "usuarioId",
    as: "usuario",
});

Doador.hasMany(Doacao, {
    foreignKey: "doadorId",
    as: "doacoes",
});

Doacao.belongsTo(Doador, {
    foreignKey: "doadorId",
    as: "doador",
});

Doacao.hasOne(Distribuicao, {
    foreignKey: "doacaoId",
    as: "distribuicao",
});

Distribuicao.belongsTo(Doacao, {
    foreignKey: "doacaoId",
    as: "doacao",
});

Instituicao.hasMany(Distribuicao, {
    foreignKey: "instituicaoId",
    as: "distribuicoes",
});

Distribuicao.belongsTo(Instituicao, {
    foreignKey: "instituicaoId",
    as: "instituicao",
});

async function criarAdministradorInicial() {
    const email = process.env.ADMIN_INITIAL_EMAIL;
    const senha = process.env.ADMIN_INITIAL_PASSWORD;
    const nome = process.env.ADMIN_INITIAL_NAME || "Administrador";
    const telefone = process.env.ADMIN_INITIAL_PHONE || "00000000000";

    if (!email || !senha) {
        console.warn(
            "Credenciais iniciais do ADMIN não configuradas. Administrador não foi criado."
        );

        return;
    }

    const emailNormalizado = email.trim().toLowerCase();

    const administradorExistente = await Usuario.findOne({
        where: {
            email: emailNormalizado,
        },
    });

    if (administradorExistente) {
        console.log("Administrador inicial já existe.");
        return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await Usuario.create({
        nome,
        email: emailNormalizado,
        senha: senhaHash,
        telefone,
        tipoUsuario: "ADMIN",
    });

    console.log("Administrador inicial criado com sucesso!");
}

export async function inicializarBanco() {
    try {
        await sequelize.authenticate();

        await sequelize.sync();

        await criarAdministradorInicial();

        console.log("Banco de dados conectado e sincronizado!");
    } catch (error) {
        console.error("Erro ao inicializar o banco:", error);
        throw error;
    }
}

export {
    sequelize,
    Usuario,
    Doador,
    Doacao,
    Instituicao,
    Distribuicao,
};