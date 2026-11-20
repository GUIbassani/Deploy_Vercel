
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    Distribuicao,
    Doacao,
    Instituicao,
    inicializarBanco,
    sequelize,
} from "@/src/models";
import { verificarToken } from "@/src/lib/auth";

async function obterAdministrador() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return null;
    }

    try {
        const usuario = await verificarToken(token);

        if (usuario.tipoUsuario !== "ADMIN") {
            return null;
        }

        return usuario;
    } catch {
        return null;
    }
}

export async function GET() {
    try {
        const administrador = await obterAdministrador();

        if (!administrador) {
            return NextResponse.json(
                { mensagem: "Acesso permitido somente para administradores." },
                { status: 403 }
            );
        }

        await inicializarBanco();

        const distribuicoes = await Distribuicao.findAll({
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
            order: [["id", "DESC"]],
        });

        return NextResponse.json(distribuicoes, { status: 200 });

    } catch (error) {
        console.error("Erro ao listar distribuições:", error);

        return NextResponse.json(
            { mensagem: "Erro ao buscar distribuições." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    let transaction: Awaited<ReturnType<typeof sequelize.transaction>> | null = null;
    let transactionFinalizada = false;

    try {
        const administrador = await obterAdministrador();

        if (!administrador) {
            return NextResponse.json(
                { mensagem: "Acesso permitido somente para administradores." },
                { status: 403 }
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

        const { doacaoId, instituicaoId } = dados;

        const idDoacao = Number(doacaoId);
        const idInstituicao = Number(instituicaoId);

        if (
            doacaoId === undefined ||
            doacaoId === null ||
            doacaoId === "" ||
            !Number.isSafeInteger(idDoacao) ||
            idDoacao <= 0 ||
            instituicaoId === undefined ||
            instituicaoId === null ||
            instituicaoId === "" ||
            !Number.isSafeInteger(idInstituicao) ||
            idInstituicao <= 0
        ) {
            return NextResponse.json(
                { mensagem: "Informe uma doação e uma instituição válidas." },
                { status: 400 }
            );
        }

        transaction = await sequelize.transaction();

        const doacao = await Doacao.findByPk(idDoacao, {
            transaction,
        });

        if (!doacao) {
            await transaction.rollback();
            transactionFinalizada = true;

            return NextResponse.json(
                { mensagem: "Doação não encontrada." },
                { status: 404 }
            );
        }

        const instituicao = await Instituicao.findByPk(idInstituicao, {
            transaction,
        });

        if (!instituicao) {
            await transaction.rollback();
            transactionFinalizada = true;

            return NextResponse.json(
                { mensagem: "Instituição não encontrada." },
                { status: 404 }
            );
        }

        if (doacao.status !== "PENDENTE") {
            await transaction.rollback();
            transactionFinalizada = true;

            return NextResponse.json(
                { mensagem: "Apenas doações pendentes podem ser encaminhadas." },
                { status: 400 }
            );
        }

        const distribuicaoExistente = await Distribuicao.findOne({
            where: { doacaoId: idDoacao },
            transaction,
        });

        if (distribuicaoExistente) {
            await transaction.rollback();
            transactionFinalizada = true;

            return NextResponse.json(
                { mensagem: "Esta doação já possui uma distribuição." },
                { status: 409 }
            );
        }

        const distribuicao = await Distribuicao.create({
            doacaoId: idDoacao,
            instituicaoId: idInstituicao,
            dataEncaminhamento: new Date(),
            status: "ENCAMINHADA",
        }, { transaction });

        await doacao.update({
            status: "ENCAMINHADA",
        }, { transaction });

        await transaction.commit();
        transactionFinalizada = true;

        return NextResponse.json(
            distribuicao,
            { status: 201 }
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

        console.error("Erro ao cadastrar distribuição:", error);

        const erro = error as { name?: string };

        if (
            erro.name === "SequelizeForeignKeyConstraintError" ||
            erro.name === "SequelizeUniqueConstraintError"
        ) {
            return NextResponse.json(
                { mensagem: "Não foi possível cadastrar a distribuição devido a um conflito nos registros." },
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
            { mensagem: "Erro ao cadastrar distribuição." },
            { status: 500 }
        );
    }
}
