import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    Doacao,
    Doador,
    inicializarBanco,
} from "@/src/models/Index";
import { verificarToken } from "@/src/lib/auth";

type Params = {
    params: Promise<{ id: string }>;
};

type StatusDoacao =
    | "PENDENTE"
    | "ENCAMINHADA"
    | "ENTREGUE"
    | "CANCELADA";

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

async function usuarioPodeAcessarDoacao(
    doacao: Doacao,
    usuarioId: number,
    tipoUsuario: "ADMIN" | "DOADOR"
) {
    if (tipoUsuario === "ADMIN") {
        return true;
    }

    const doador = await Doador.findOne({
        where: {
            id: doacao.doadorId,
            usuarioId,
        },
    });

    return Boolean(doador);
}

export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        const usuario = await obterUsuarioAutenticado(request);

        if (!usuario) {
            return NextResponse.json(
                { mensagem: "Autenticação necessária ou token inválido." },
                { status: 401 }
            );
        }

        await inicializarBanco();

        const { id } = await params;

        if (!/^[1-9]\d*$/.test(id)) {
            return NextResponse.json(
                { mensagem: "ID da doação inválido." },
                { status: 400 }
            );
        }

        const doacao = await Doacao.findByPk(id);

        if (!doacao) {
            return NextResponse.json(
                { mensagem: "Doação não encontrada." },
                { status: 404 }
            );
        }

        const permitido = await usuarioPodeAcessarDoacao(
            doacao,
            usuario.id,
            usuario.tipoUsuario
        );

        if (!permitido) {
            return NextResponse.json(
                { mensagem: "Doação não encontrada." },
                { status: 404 }
            );
        }

        return NextResponse.json(doacao, { status: 200 });

    } catch (error) {
        console.error("Erro ao buscar doação:", error);

        return NextResponse.json(
            { mensagem: "Erro ao buscar doação." },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: Params
) {
    try {
        const usuario = await obterUsuarioAutenticado(request);

        if (!usuario) {
            return NextResponse.json(
                { mensagem: "Autenticação necessária ou token inválido." },
                { status: 401 }
            );
        }

        await inicializarBanco();

        const { id } = await params;

        if (!/^[1-9]\d*$/.test(id)) {
            return NextResponse.json(
                { mensagem: "ID da doação inválido." },
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

        const doacao = await Doacao.findByPk(id);

        if (!doacao) {
            return NextResponse.json(
                { mensagem: "Doação não encontrada." },
                { status: 404 }
            );
        }

        const permitido = await usuarioPodeAcessarDoacao(
            doacao,
            usuario.id,
            usuario.tipoUsuario
        );

        if (!permitido) {
            return NextResponse.json(
                { mensagem: "Doação não encontrada." },
                { status: 404 }
            );
        }

        if (
            usuario.tipoUsuario === "DOADOR" &&
            (dados.doadorId !== undefined || dados.status !== undefined)
        ) {
            return NextResponse.json(
                {
                    mensagem:
                        "Doadores não podem alterar o proprietário ou o status da doação.",
                },
                { status: 403 }
            );
        }

        const atualizacao: Record<string, unknown> = {};

        if (dados.doadorId !== undefined) {
            if (
                !Number.isInteger(Number(dados.doadorId)) ||
                Number(dados.doadorId) <= 0
            ) {
                return NextResponse.json(
                    { mensagem: "Doador inválido." },
                    { status: 400 }
                );
            }

            atualizacao.doadorId = Number(dados.doadorId);
        }

        if (dados.dataValidade !== undefined) {
            if (
                typeof dados.dataValidade !== "string" ||
                !dados.dataValidade.trim() ||
                isNaN(Date.parse(dados.dataValidade))
            ) {
                return NextResponse.json(
                    { mensagem: "Data de validade inválida." },
                    { status: 400 }
                );
            }

            atualizacao.dataValidade = new Date(dados.dataValidade);
        }

        if (dados.status !== undefined) {
            const statusRecebido: unknown = dados.status;

            if (
                statusRecebido !== "PENDENTE" &&
                statusRecebido !== "ENCAMINHADA" &&
                statusRecebido !== "ENTREGUE" &&
                statusRecebido !== "CANCELADA"
            ) {
                return NextResponse.json(
                    { mensagem: "Status de doação inválido." },
                    { status: 400 }
                );
            }

            atualizacao.status = statusRecebido as StatusDoacao;
        }

        if (dados.observacoes !== undefined) {
            if (
                dados.observacoes !== null &&
                typeof dados.observacoes !== "string"
            ) {
                return NextResponse.json(
                    { mensagem: "Observações inválidas." },
                    { status: 400 }
                );
            }

            atualizacao.observacoes =
                typeof dados.observacoes === "string"
                    ? dados.observacoes.trim()
                    : null;
        }

        if (Object.keys(atualizacao).length === 0) {
            return NextResponse.json(
                { mensagem: "Nenhum campo válido foi informado." },
                { status: 400 }
            );
        }

        await doacao.update(atualizacao);

        return NextResponse.json(doacao, { status: 200 });

    } catch (error) {
        console.error("Erro ao atualizar doação:", error);

        const erro = error as { name?: string };

        if (erro.name === "SequelizeForeignKeyConstraintError") {
            return NextResponse.json(
                { mensagem: "O doador informado não existe ou possui restrições." },
                { status: 409 }
            );
        }

        if (erro.name === "SequelizeValidationError") {
            return NextResponse.json(
                { mensagem: "Os dados informados são inválidos." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { mensagem: "Erro ao atualizar doação." },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: Params
) {
    try {
        const usuario = await obterUsuarioAutenticado(request);

        if (!usuario) {
            return NextResponse.json(
                { mensagem: "Autenticação necessária ou token inválido." },
                { status: 401 }
            );
        }

        await inicializarBanco();

        const { id } = await params;

        if (!/^[1-9]\d*$/.test(id)) {
            return NextResponse.json(
                { mensagem: "ID da doação inválido." },
                { status: 400 }
            );
        }

        const doacao = await Doacao.findByPk(id);

        if (!doacao) {
            return NextResponse.json(
                { mensagem: "Doação não encontrada." },
                { status: 404 }
            );
        }

        const permitido = await usuarioPodeAcessarDoacao(
            doacao,
            usuario.id,
            usuario.tipoUsuario
        );

        if (!permitido) {
            return NextResponse.json(
                { mensagem: "Doação não encontrada." },
                { status: 404 }
            );
        }

        await doacao.destroy();

        return NextResponse.json(
            { mensagem: "Doação excluída com sucesso." },
            { status: 200 }
        );

    } catch (error) {
        console.error("Erro ao excluir doação:", error);

        const erro = error as { name?: string };

        if (erro.name === "SequelizeForeignKeyConstraintError") {
            return NextResponse.json(
                {
                    mensagem:
                        "Não é possível excluir esta doação porque existem registros vinculados.",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { mensagem: "Erro ao excluir doação." },
            { status: 500 }
        );
    }
}