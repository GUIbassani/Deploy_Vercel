import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    Doacao,
    Doador,
    inicializarBanco,
} from "@/src/models";
import { verificarToken } from "@/src/lib/auth";

async function obterUsuarioAutenticado(request: Request) {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("token")?.value;

    const authorization = request.headers.get("Authorization");

    const tokenBearer = authorization?.startsWith("Bearer ")
        ? authorization.substring(7)
        : null;

    const token = tokenBearer || tokenCookie;

    if (!token) {
        return null;
    }

    try {
        return await verificarToken(token);
    } catch {
        return null;
    }
}

export async function GET(request: Request) {
    try {
        const usuario = await obterUsuarioAutenticado(request);

        if (!usuario) {
            return NextResponse.json(
                { mensagem: "Autenticação necessária ou token inválido." },
                { status: 401 }
            );
        }

        await inicializarBanco();

        // ADMIN: busca todas as doações incluindo os dados do doador
        if (usuario.tipoUsuario === "ADMIN") {
            const doacoes = await Doacao.findAll({
                order: [["id", "DESC"]],
            });

            const doacoesComDoador = await Promise.all(
                doacoes.map(async (doacao) => {
                    const doador = await Doador.findByPk(doacao.doadorId);

                    return {
                        ...doacao.toJSON(),
                        doador: doador ? doador.toJSON() : null,
                    };
                })
            );

            return NextResponse.json(doacoesComDoador, { status: 200 });
        }

        // DOADOR: busca apenas as doações do usuário autenticado
        const doador = await Doador.findOne({
            where: {
                usuarioId: usuario.id,
            },
        });

        if (!doador) {
            return NextResponse.json([], { status: 200 });
        }

        const doacoes = await Doacao.findAll({
            where: {
                doadorId: doador.id,
            },
            order: [["id", "DESC"]],
        });

        return NextResponse.json(doacoes, { status: 200 });

    } catch (error) {
        console.error("Erro ao listar doações:", error);

        return NextResponse.json(
            { mensagem: "Erro ao buscar doações." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await inicializarBanco();

        const usuario = await obterUsuarioAutenticado(request);

        if (!usuario) {
            return NextResponse.json(
                { mensagem: "Autenticação necessária ou token inválido." },
                { status: 401 }
            );
        }

        if (usuario.tipoUsuario !== "DOADOR") {
            return NextResponse.json(
                { mensagem: "Somente doadores podem cadastrar doações." },
                { status: 403 }
            );
        }

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

        const { dataValidade, observacoes } = dados;

        if (
            typeof dataValidade !== "string" ||
            !dataValidade.trim()
        ) {
            return NextResponse.json(
                { mensagem: "Data de validade é obrigatória." },
                { status: 400 }
            );
        }

        const dataValidadeConvertida = new Date(dataValidade);

        if (Number.isNaN(dataValidadeConvertida.getTime())) {
            return NextResponse.json(
                { mensagem: "Data de validade inválida." },
                { status: 400 }
            );
        }

        if (
            observacoes !== undefined &&
            typeof observacoes !== "string"
        ) {
            return NextResponse.json(
                { mensagem: "Observações inválidas." },
                { status: 400 }
            );
        }

        if (!observacoes?.trim()) {
            return NextResponse.json(
                { mensagem: "Informe os detalhes da doação." },
                { status: 400 }
            );
        }

        const doador = await Doador.findOne({
            where: {
                usuarioId: usuario.id,
            },
        });

        if (!doador) {
            return NextResponse.json(
                { mensagem: "Cadastro de doador não encontrado." },
                { status: 404 }
            );
        }

        const novaDoacao = await Doacao.create({
            doadorId: doador.id,
            dataValidade: dataValidadeConvertida,
            observacoes: observacoes.trim(),
            status: "PENDENTE",
        });

        return NextResponse.json(
            {
                mensagem: "Doação cadastrada com sucesso!",
                doacao: novaDoacao,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Erro ao cadastrar doação:", error);

        return NextResponse.json(
            { mensagem: "Erro ao cadastrar doação." },
            { status: 500 }
        );
    }
}