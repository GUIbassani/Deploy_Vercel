import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    Doador,
    Usuario,
    inicializarBanco,
} from "@/src/models";
import { verificarToken } from "@/src/lib/auth";

async function verificarAdministrador(request: Request) {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("token")?.value;

    const authorization = request.headers.get("Authorization");
    const tokenBearer = authorization?.startsWith("Bearer ")
        ? authorization.substring(7)
        : null;

    const token = tokenBearer || tokenCookie;

    if (!token) {
        return {
            autorizado: false as const,
            status: 401,
            mensagem: "Autenticação necessária.",
        };
    }

    try {
        const usuario = await verificarToken(token);

        if (usuario.tipoUsuario !== "ADMIN") {
            return {
                autorizado: false as const,
                status: 403,
                mensagem: "Acesso permitido somente para administradores.",
            };
        }

        return {
            autorizado: true as const,
            usuario,
        };
    } catch {
        return {
            autorizado: false as const,
            status: 401,
            mensagem: "Token inválido ou expirado.",
        };
    }
}

export async function GET(request: Request) {
    try {
        const autenticacao = await verificarAdministrador(request);

        if (!autenticacao.autorizado) {
            return NextResponse.json(
                { mensagem: autenticacao.mensagem },
                { status: autenticacao.status }
            );
        }

        await inicializarBanco();

        const doadores = await Doador.findAll({
            order: [["id", "DESC"]],
        });

        return NextResponse.json(doadores, { status: 200 });

    } catch (error) {
        console.error("Erro ao listar doadores:", error);

        return NextResponse.json(
            { mensagem: "Erro ao buscar doadores." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const autenticacao = await verificarAdministrador(request);

        if (!autenticacao.autorizado) {
            return NextResponse.json(
                { mensagem: autenticacao.mensagem },
                { status: autenticacao.status }
            );
        }

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
            usuarioId,
            razaoSocial,
            nomeFantasia,
            cnpj,
            endereco,
        } = dados;

        const idUsuario = Number(usuarioId);

        if (
            usuarioId === undefined ||
            usuarioId === null ||
            usuarioId === "" ||
            !Number.isSafeInteger(idUsuario) ||
            idUsuario <= 0 ||
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
                { mensagem: "Todos os campos são obrigatórios e devem ser válidos." },
                { status: 400 }
            );
        }

        const usuario = await Usuario.findByPk(idUsuario);

        if (!usuario) {
            return NextResponse.json(
                { mensagem: "Usuário não encontrado." },
                { status: 404 }
            );
        }

        if (usuario.tipoUsuario !== "DOADOR") {
            return NextResponse.json(
                {
                    mensagem:
                        "Somente usuários do tipo DOADOR podem possuir um perfil de doador.",
                },
                { status: 400 }
            );
        }

        const doador = await Doador.create({
            usuarioId: idUsuario,
            razaoSocial: razaoSocial.trim(),
            nomeFantasia: nomeFantasia.trim(),
            cnpj: cnpj.trim(),
            endereco: endereco.trim(),
        });

        return NextResponse.json(doador, { status: 201 });

    } catch (error) {
        console.error("Erro ao cadastrar doador:", error);

        const erro = error as { name?: string };

        if (
            erro.name === "SequelizeForeignKeyConstraintError"
        ) {
            return NextResponse.json(
                {
                    mensagem:
                        "O usuário informado não existe ou possui restrições.",
                },
                { status: 409 }
            );
        }

        if (
            erro.name === "SequelizeUniqueConstraintError"
        ) {
            return NextResponse.json(
                {
                    mensagem:
                        "Já existe um doador cadastrado com esses dados únicos.",
                },
                { status: 409 }
            );
        }

        if (
            erro.name === "SequelizeValidationError"
        ) {
            return NextResponse.json(
                { mensagem: "Os dados informados são inválidos." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { mensagem: "Erro ao cadastrar doador." },
            { status: 500 }
        );
    }
}