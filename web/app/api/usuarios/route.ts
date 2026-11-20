
import { NextResponse } from "next/server";
import {
    Usuario,
    Doador,
    sequelize,
    inicializarBanco,
} from "@/src/models";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        await inicializarBanco();

        const usuarios = await Usuario.findAll({
            attributes: { exclude: ["senha"] },
            order: [["id", "DESC"]],
        });

        return NextResponse.json(usuarios, { status: 200 });

    } catch (error) {
        console.error("Erro ao listar usuários:", error);

        return NextResponse.json(
            { mensagem: "Erro ao buscar usuários." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await inicializarBanco();

        let dados;

        try {
            dados = await request.json();
        } catch {
            return NextResponse.json(
                { mensagem: "Corpo da requisição inválido." },
                { status: 400 }
            );
        }

        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            return NextResponse.json(
                { mensagem: "Dados inválidos." },
                { status: 400 }
            );
        }

        const {
            nome,
            email,
            senha,
            telefone,
            razaoSocial,
            nomeFantasia,
            cnpj,
            endereco,
        } = dados;

        if (
            typeof nome !== "string" ||
            !nome.trim() ||
            typeof email !== "string" ||
            !email.trim() ||
            typeof senha !== "string" ||
            !senha.trim() ||
            typeof telefone !== "string" ||
            !telefone.trim() ||
            typeof razaoSocial !== "string" ||
            !razaoSocial.trim() ||
            typeof nomeFantasia !== "string" ||
            !nomeFantasia.trim() ||
            typeof cnpj !== "string" ||
            !cnpj.trim() ||
            typeof endereco !== "string" ||
            !endereco.trim()
        ) {
            return NextResponse.json(
                {
                    mensagem:
                        "Todos os campos obrigatórios devem ser preenchidos.",
                },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return NextResponse.json(
                { mensagem: "E-mail inválido." },
                { status: 400 }
            );
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const resultado = await sequelize.transaction(async (transaction) => {
            const usuario = await Usuario.create(
                {
                    nome: nome.trim(),
                    email: email.trim().toLowerCase(),
                    senha: senhaHash,
                    telefone: telefone.trim(),
                    tipoUsuario: "DOADOR",
                },
                { transaction }
            );

            const doador = await Doador.create(
                {
                    usuarioId: usuario.id,
                    razaoSocial: razaoSocial.trim(),
                    nomeFantasia: nomeFantasia.trim(),
                    cnpj: cnpj.trim(),
                    endereco: endereco.trim(),
                },
                { transaction }
            );

            return {
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    telefone: usuario.telefone,
                    tipoUsuario: usuario.tipoUsuario,
                },
                doador: {
                    id: doador.id,
                    usuarioId: doador.usuarioId,
                    razaoSocial: doador.razaoSocial,
                    nomeFantasia: doador.nomeFantasia,
                    cnpj: doador.cnpj,
                    endereco: doador.endereco,
                },
            };
        });

        return NextResponse.json(resultado, { status: 201 });

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);

        const erro = error as { name?: string };

        if (erro.name === "SequelizeUniqueConstraintError") {
            return NextResponse.json(
                {
                    mensagem:
                        "Este e-mail ou CNPJ já está cadastrado.",
                },
                { status: 409 }
            );
        }

        if (
            erro.name === "SequelizeValidationError" ||
            erro.name === "SequelizeForeignKeyConstraintError"
        ) {
            return NextResponse.json(
                { mensagem: "Os dados informados são inválidos." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { mensagem: "Erro ao cadastrar usuário." },
            { status: 500 }
        );
    }
}
