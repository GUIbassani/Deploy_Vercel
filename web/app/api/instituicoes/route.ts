import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Instituicao, inicializarBanco } from "@/src/models";
import { verificarToken } from "@/src/lib/auth";

async function verificarAdministrador() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

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

export async function GET() {
    try {
        const autenticacao = await verificarAdministrador();

        if (!autenticacao.autorizado) {
            return NextResponse.json(
                { mensagem: autenticacao.mensagem },
                { status: autenticacao.status }
            );
        }

        await inicializarBanco();

        const instituicoes = await Instituicao.findAll({
            order: [["id", "DESC"]],
        });

        return NextResponse.json(instituicoes, { status: 200 });

    } catch (error) {
        console.error("Erro ao listar instituições:", error);

        return NextResponse.json(
            { mensagem: "Erro ao buscar instituições." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const autenticacao = await verificarAdministrador();

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
            nome,
            endereco,
            telefone,
            tipo,
        } = dados;

        if (
            typeof nome !== "string" ||
            !nome.trim() ||
            typeof tipo !== "string" ||
            !tipo.trim()
        ) {
            return NextResponse.json(
                { mensagem: "Nome e tipo da instituição são obrigatórios." },
                { status: 400 }
            );
        }

        if (
            (endereco !== undefined && endereco !== null && typeof endereco !== "string") ||
            (telefone !== undefined && telefone !== null && typeof telefone !== "string")
        ) {
            return NextResponse.json(
                { mensagem: "Endereço ou telefone inválido." },
                { status: 400 }
            );
        }

        const instituicao = await Instituicao.create({
            nome: nome.trim(),
            endereco: endereco?.trim() || undefined,
            telefone: telefone?.trim() || undefined,
            tipo: tipo.trim(),
        });

        return NextResponse.json(instituicao, { status: 201 });

    } catch (error) {
        console.error("Erro ao cadastrar instituição:", error);

        const erro = error as { name?: string };

        if (erro.name === "SequelizeValidationError") {
            return NextResponse.json(
                { mensagem: "Os dados informados são inválidos." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { mensagem: "Erro ao cadastrar instituição." },
            { status: 500 }
        );
    }
}