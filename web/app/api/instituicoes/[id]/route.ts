import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Instituicao, inicializarBanco } from "@/src/models/Index";
import { verificarToken } from "@/src/lib/auth";

type Params = {
    params: Promise<{ id: string }>;
};

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

export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        const autenticacao = await verificarAdministrador();

        if (!autenticacao.autorizado) {
            return NextResponse.json(
                { mensagem: autenticacao.mensagem },
                { status: autenticacao.status }
            );
        }

        await inicializarBanco();

        const { id } = await params;

        if (!/^[1-9]\d*$/.test(id)) {
            return NextResponse.json(
                { mensagem: "ID da instituição inválido." },
                { status: 400 }
            );
        }

        const instituicao = await Instituicao.findByPk(id);

        if (!instituicao) {
            return NextResponse.json(
                { mensagem: "Instituição não encontrada." },
                { status: 404 }
            );
        }

        return NextResponse.json(instituicao, { status: 200 });

    } catch (error) {
        console.error("Erro ao buscar instituição:", error);

        return NextResponse.json(
            { mensagem: "Erro ao buscar instituição." },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: Params
) {
    try {
        const autenticacao = await verificarAdministrador();

        if (!autenticacao.autorizado) {
            return NextResponse.json(
                { mensagem: autenticacao.mensagem },
                { status: autenticacao.status }
            );
        }

        await inicializarBanco();

        const { id } = await params;

        if (!/^[1-9]\d*$/.test(id)) {
            return NextResponse.json(
                { mensagem: "ID da instituição inválido." },
                { status: 400 }
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

        const instituicao = await Instituicao.findByPk(id);

        if (!instituicao) {
            return NextResponse.json(
                { mensagem: "Instituição não encontrada." },
                { status: 404 }
            );
        }

        const {
            nome,
            endereco,
            telefone,
            tipo,
        } = dados;

        const atualizacao: {
            nome?: string;
            endereco?: string;
            telefone?: string;
            tipo?: string;
        } = {};

        if (nome !== undefined) {
            if (typeof nome !== "string" || !nome.trim()) {
                return NextResponse.json(
                    { mensagem: "Nome inválido." },
                    { status: 400 }
                );
            }

            atualizacao.nome = nome.trim();
        }

        if (tipo !== undefined) {
            if (typeof tipo !== "string" || !tipo.trim()) {
                return NextResponse.json(
                    { mensagem: "Tipo inválido." },
                    { status: 400 }
                );
            }

            atualizacao.tipo = tipo.trim();
        }

        if (endereco !== undefined) {
            if (endereco !== null && typeof endereco !== "string") {
                return NextResponse.json(
                    { mensagem: "Endereço inválido." },
                    { status: 400 }
                );
            }

            atualizacao.endereco = endereco?.trim() || "";
        }

        if (telefone !== undefined) {
            if (telefone !== null && typeof telefone !== "string") {
                return NextResponse.json(
                    { mensagem: "Telefone inválido." },
                    { status: 400 }
                );
            }

            atualizacao.telefone = telefone?.trim() || "";
        }

        if (Object.keys(atualizacao).length === 0) {
            return NextResponse.json(
                { mensagem: "Informe pelo menos um campo para atualizar." },
                { status: 400 }
            );
        }

        await instituicao.update(atualizacao);

        return NextResponse.json(instituicao, { status: 200 });

    } catch (error) {
        console.error("Erro ao atualizar instituição:", error);

        const erro = error as { name?: string };

        if (erro.name === "SequelizeValidationError") {
            return NextResponse.json(
                { mensagem: "Os dados informados são inválidos." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { mensagem: "Erro ao atualizar instituição." },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: Params
) {
    try {
        const autenticacao = await verificarAdministrador();

        if (!autenticacao.autorizado) {
            return NextResponse.json(
                { mensagem: autenticacao.mensagem },
                { status: autenticacao.status }
            );
        }

        await inicializarBanco();

        const { id } = await params;

        if (!/^[1-9]\d*$/.test(id)) {
            return NextResponse.json(
                { mensagem: "ID da instituição inválido." },
                { status: 400 }
            );
        }

        const instituicao = await Instituicao.findByPk(id);

        if (!instituicao) {
            return NextResponse.json(
                { mensagem: "Instituição não encontrada." },
                { status: 404 }
            );
        }

        await instituicao.destroy();

        return NextResponse.json(
            { mensagem: "Instituição excluída com sucesso." },
            { status: 200 }
        );

    } catch (error) {
        console.error("Erro ao excluir instituição:", error);

        const erro = error as { name?: string };

        if (erro.name === "SequelizeForeignKeyConstraintError") {
            return NextResponse.json(
                {
                    mensagem: "Não é possível excluir esta instituição porque existem registros vinculados a ela."
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { mensagem: "Erro ao excluir instituição." },
            { status: 500 }
        );
    }
}