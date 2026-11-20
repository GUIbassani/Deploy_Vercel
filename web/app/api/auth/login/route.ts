import { NextResponse } from "next/server";
import { Usuario, inicializarBanco } from "@/src/models";
import { gerarToken } from "@/src/lib/auth";
import bcrypt from "bcryptjs";

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

        const { email, senha } = dados;

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof senha !== "string" ||
            !senha
        ) {
            return NextResponse.json(
                { mensagem: "E-mail e senha são obrigatórios." },
                { status: 400 }
            );
        }

        const usuario = await Usuario.findOne({
            where: {
                email: email.trim().toLowerCase(),
            },
        });

        console.log("Email recebido no login:", email.trim().toLowerCase());
        console.log("Usuário encontrado:", !!usuario);

        if (!usuario) {
            return NextResponse.json(
                { mensagem: "E-mail ou senha incorretos." },
                { status: 401 }
            );
        }

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaValida) {
            return NextResponse.json(
                { mensagem: "E-mail ou senha incorretos." },
                { status: 401 }
            );
        }

        const token = await gerarToken({
            id: usuario.id,
            tipoUsuario: usuario.tipoUsuario,
        });

        const resposta = NextResponse.json(
            {
                mensagem: "Login realizado com sucesso.",
                token,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    telefone: usuario.telefone,
                    tipoUsuario: usuario.tipoUsuario,
                },
            },
            { status: 200 }
        );

        resposta.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 8,
        });

        return resposta;

    } catch (error) {
        console.error("Erro ao realizar login:", error);

        return NextResponse.json(
            { mensagem: "Erro interno ao realizar login." },
            { status: 500 }
        );
    }
}