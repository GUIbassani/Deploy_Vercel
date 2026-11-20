
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    Distribuicao,
    Doacao,
    Instituicao,
    inicializarBanco,
    sequelize,
} from "@/src/models/Index";
import { verificarToken } from "@/src/lib/auth";

type Params = {
    params: Promise<{ id: string }>;
};

type StatusFinalizacao = "ENTREGUE" | "CANCELADA";

async function verificarAdministrador() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return {
            autorizado: false,
            status: 401,
            mensagem: "Autenticação necessária.",
        };
    }

    try {
        const usuario = await verificarToken(token);

        if (usuario.tipoUsuario !== "ADMIN") {
            return {
                autorizado: false,
                status: 403,
                mensagem: "Acesso permitido somente para administradores.",
            };
        }

        return {
            autorizado: true,
            usuario,
        };
    } catch {
        return {
            autorizado: false,
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
                { mensagem: "ID da distribuição inválido." },
                { status: 400 }
            );
        }

        const distribuicao = await Distribuicao.findByPk(id, {
            include: [
                {
                    model: Doacao,
                    as: "doacao",
                },
                {
                    model: Instituicao,
                    as: "instituicao",
                },
            ],
        });

        if (!distribuicao) {
            return NextResponse.json(
                { mensagem: "Distribuição não encontrada." },
                { status: 404 }
            );
        }

        return NextResponse.json(distribuicao, { status: 200 });

    } catch (error) {
        console.error("Erro ao buscar distribuição:", error);

        return NextResponse.json(
            { mensagem: "Erro ao buscar distribuição." },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: Params
) {
    let transaction: Awaited<ReturnType<typeof sequelize.transaction>> | null = null;
    let transactionFinalizada = false;

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
                { mensagem: "ID da distribuição inválido." },
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

        const statusRecebido: unknown = dados.status;

        if (
            statusRecebido !== "ENTREGUE" &&
            statusRecebido !== "CANCELADA"
        ) {
            return NextResponse.json(
                { mensagem: "Status informado inválido." },
                { status: 400 }
            );
        }

        const status: StatusFinalizacao = statusRecebido;

        transaction = await sequelize.transaction();

        const distribuicao = await Distribuicao.findByPk(id, {
            transaction,
        });

        if (!distribuicao) {
            await transaction.rollback();
            transactionFinalizada = true;

            return NextResponse.json(
                { mensagem: "Distribuição não encontrada." },
                { status: 404 }
            );
        }

        if (distribuicao.status !== "ENCAMINHADA") {
            await transaction.rollback();
            transactionFinalizada = true;

            return NextResponse.json(
                { mensagem: "Não é possível alterar uma distribuição finalizada." },
                { status: 400 }
            );
        }

        const doacao = await Doacao.findByPk(
            distribuicao.doacaoId,
            { transaction }
        );

        if (!doacao) {
            await transaction.rollback();
            transactionFinalizada = true;

            return NextResponse.json(
                { mensagem: "Doação relacionada não encontrada." },
                { status: 404 }
            );
        }

        await distribuicao.update({
            status,
            ...(status === "ENTREGUE"
                ? { dataEntrega: new Date() }
                : {}),
        }, { transaction });

        await doacao.update({
            status,
        }, { transaction });

        await transaction.commit();
        transactionFinalizada = true;

        return NextResponse.json(
            distribuicao,
            { status: 200 }
        );

    } catch (error) {
        if (transaction && !transactionFinalizada) {
            try {
                await transaction.rollback();
                transactionFinalizada = true;
            } catch (rollbackError) {
                console.error("Erro ao desfazer transação:", rollbackError);
            }
        }

        console.error("Erro ao atualizar distribuição:", error);

        const erro = error as { name?: string };

        if (
            erro.name === "SequelizeForeignKeyConstraintError"
        ) {
            return NextResponse.json(
                { mensagem: "Não foi possível atualizar a distribuição devido a registros relacionados." },
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
            { mensagem: "Erro ao atualizar distribuição." },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: Params
) {
    let transaction: Awaited<ReturnType<typeof sequelize.transaction>> | null = null;
    let transactionFinalizada = false;

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
                { mensagem: "ID da distribuição inválido." },
                { status: 400 }
            );
        }

        transaction = await sequelize.transaction();

        const distribuicao = await Distribuicao.findByPk(id, {
            transaction,
        });

        if (!distribuicao) {
            await transaction.rollback();
            transactionFinalizada = true;

            return NextResponse.json(
                { mensagem: "Distribuição não encontrada." },
                { status: 404 }
            );
        }

        if (distribuicao.status !== "ENCAMINHADA") {
            await transaction.rollback();
            transactionFinalizada = true;

            return NextResponse.json(
                { mensagem: "Não é possível excluir uma distribuição finalizada." },
                { status: 400 }
            );
        }

        const doacao = await Doacao.findByPk(
            distribuicao.doacaoId,
            { transaction }
        );

        if (!doacao) {
            await transaction.rollback();
            transactionFinalizada = true;

            return NextResponse.json(
                { mensagem: "Doação relacionada não encontrada." },
                { status: 404 }
            );
        }

        await distribuicao.destroy({ transaction });

        await doacao.update({
            status: "PENDENTE",
        }, { transaction });

        await transaction.commit();
        transactionFinalizada = true;

        return NextResponse.json(
            { mensagem: "Distribuição excluída com sucesso." },
            { status: 200 }
        );

    } catch (error) {
        if (transaction && !transactionFinalizada) {
            try {
                await transaction.rollback();
                transactionFinalizada = true;
            } catch (rollbackError) {
                console.error("Erro ao desfazer transação:", rollbackError);
            }
        }

        console.error("Erro ao excluir distribuição:", error);

        const erro = error as { name?: string };

        if (
            erro.name === "SequelizeForeignKeyConstraintError"
        ) {
            return NextResponse.json(
                { mensagem: "Não foi possível excluir a distribuição devido a registros relacionados." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { mensagem: "Erro ao excluir distribuição." },
            { status: 500 }
        );
    }
}
