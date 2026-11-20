
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Usuario, sequelize, inicializarBanco } from "@/src/models/Index";
import { TipoUsuario } from "@/src/models/Usuario";
import { verificarToken } from "@/src/lib/auth";
import bcrypt from "bcryptjs";

type Params = {
    params: Promise<{ id: string }>;
};

const tiposPermitidos: TipoUsuario[] = ["ADMIN", "DOADOR"];

async function autenticarAdmin() {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return {
            erro: NextResponse.json(
                { mensagem: "Autenticação necessária." },
                { status: 401 }
            ),
        };
    }

    try {
        const usuario = await verificarToken(token);

        if (usuario.tipoUsuario !== "ADMIN") {
            return {
                erro: NextResponse.json(
                    { mensagem: "Acesso permitido somente para administradores." },
                    { status: 403 }
                ),
            };
        }

        return { usuario };
    } catch {
        return {
            erro: NextResponse.json(
                { mensagem: "Token inválido ou expirado." },
                { status: 401 }
            ),
        };
    }
}

export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        const autenticacao = await autenticarAdmin();

        if ("erro" in autenticacao) return autenticacao.erro;

        await inicializarBanco();

        const { id } = await params;

        if (!/^[1-9]\d*$/.test(id)) {
            return NextResponse.json(
                { mensagem: "ID do usuário inválido." },
                { status: 400 }
            );
        }

        const usuario = await Usuario.findByPk(id, {
            attributes: { exclude: ["senha"] },
        });

        if (!usuario) {
            return NextResponse.json(
                { mensagem: "Usuário não encontrado." },
                { status: 404 }
            );
        }

        return NextResponse.json(usuario, { status: 200 });

    } catch (error) {
        console.error("Erro ao buscar usuário:", error);

        return NextResponse.json(
            { mensagem: "Erro ao buscar usuário." },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: Params
) {
    try {
        const autenticacao = await autenticarAdmin();

        if ("erro" in autenticacao) return autenticacao.erro;

        await inicializarBanco();

        const { id } = await params;

        if (!/^[1-9]\d*$/.test(id)) {
            return NextResponse.json(
                { mensagem: "ID do usuário inválido." },
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

        if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
            return NextResponse.json(
                { mensagem: "Dados inválidos." },
                { status: 400 }
            );
        }

        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return NextResponse.json(
                { mensagem: "Usuário não encontrado." },
                { status: 404 }
            );
        }

        const atualizacao: {
            nome?: string;
            email?: string;
            senha?: string;
            telefone?: string;
            tipoUsuario?: TipoUsuario;
        } = {};

        if (dados.nome !== undefined) {
            if (typeof dados.nome !== "string" || !dados.nome.trim()) {
                return NextResponse.json(
                    { mensagem: "Nome inválido." },
                    { status: 400 }
                );
            }

            atualizacao.nome = dados.nome.trim();
        }

        if (dados.email !== undefined) {
            if (
                typeof dados.email !== "string" ||
                !dados.email.trim() ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())
            ) {
                return NextResponse.json(
                    { mensagem: "E-mail inválido." },
                    { status: 400 }
                );
            }

            atualizacao.email = dados.email.trim().toLowerCase();
        }

        if (dados.senha !== undefined) {
            if (typeof dados.senha !== "string" || !dados.senha.trim()) {
                return NextResponse.json(
                    { mensagem: "Senha inválida." },
                    { status: 400 }
                );
            }

            atualizacao.senha = await bcrypt.hash(dados.senha, 10);
        }

        if (dados.telefone !== undefined) {
            if (typeof dados.telefone !== "string" || !dados.telefone.trim()) {
                return NextResponse.json(
                    { mensagem: "Telefone inválido." },
                    { status: 400 }
                );
            }

            atualizacao.telefone = dados.telefone.trim();
        }

        if (dados.tipoUsuario !== undefined) {
            if (!tiposPermitidos.includes(dados.tipoUsuario)) {
                return NextResponse.json(
                    { mensagem: "Tipo de usuário inválido." },
                    { status: 400 }
                );
            }

            if (
                autenticacao.usuario.id === usuario.id &&
                dados.tipoUsuario !== usuario.tipoUsuario
            ) {
                return NextResponse.json(
                    { mensagem: "Você não pode alterar o próprio perfil de acesso." },
                    { status: 403 }
                );
            }

            atualizacao.tipoUsuario = dados.tipoUsuario;
        }

        if (Object.keys(atualizacao).length === 0) {
            return NextResponse.json(
                { mensagem: "Nenhum campo válido foi informado para atualização." },
                { status: 400 }
            );
        }

        await sequelize.transaction(async (transaction) => {
            if (
                usuario.tipoUsuario === "ADMIN" &&
                atualizacao.tipoUsuario === "DOADOR"
            ) {
                const totalAdmins = await Usuario.count({
                    where: { tipoUsuario: "ADMIN" },
                    transaction,
                });

                if (totalAdmins <= 1) {
                    throw new Error("ULTIMO_ADMIN");
                }
            }

            await usuario.update(atualizacao, { transaction });
        });

        const usuarioResposta = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone,
            tipoUsuario: usuario.tipoUsuario,
        };

        return NextResponse.json(usuarioResposta, { status: 200 });

    } catch (error) {
        if (error instanceof Error && error.message === "ULTIMO_ADMIN") {
            return NextResponse.json(
                { mensagem: "Não é possível rebaixar o último administrador." },
                { status: 409 }
            );
        }

        console.error("Erro ao atualizar usuário:", error);

        const erro = error as { name?: string };

        if (erro.name === "SequelizeUniqueConstraintError") {
            return NextResponse.json(
                { mensagem: "Este e-mail já está cadastrado." },
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
            { mensagem: "Erro ao atualizar usuário." },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: Params
) {
    try {
        const autenticacao = await autenticarAdmin();

        if ("erro" in autenticacao) return autenticacao.erro;

        await inicializarBanco();

        const { id } = await params;

        if (!/^[1-9]\d*$/.test(id)) {
            return NextResponse.json(
                { mensagem: "ID do usuário inválido." },
                { status: 400 }
            );
        }

        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return NextResponse.json(
                { mensagem: "Usuário não encontrado." },
                { status: 404 }
            );
        }

        if (autenticacao.usuario.id === usuario.id) {
            return NextResponse.json(
                { mensagem: "Você não pode excluir sua própria conta." },
                { status: 403 }
            );
        }

        await sequelize.transaction(async (transaction) => {
            if (usuario.tipoUsuario === "ADMIN") {
                const totalAdmins = await Usuario.count({
                    where: { tipoUsuario: "ADMIN" },
                    transaction,
                });

                if (totalAdmins <= 1) {
                    throw new Error("ULTIMO_ADMIN");
                }
            }

            await usuario.destroy({ transaction });
        });

        return NextResponse.json(
            { mensagem: "Usuário excluído com sucesso." },
            { status: 200 }
        );

    } catch (error) {
        if (error instanceof Error && error.message === "ULTIMO_ADMIN") {
            return NextResponse.json(
                { mensagem: "Não é possível excluir o último administrador." },
                { status: 409 }
            );
        }

        console.error("Erro ao excluir usuário:", error);

        const erro = error as { name?: string };

        if (erro.name === "SequelizeForeignKeyConstraintError") {
            return NextResponse.json(
                { mensagem: "Não é possível excluir este usuário porque existem registros vinculados." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { mensagem: "Erro ao excluir usuário." },
            { status: 500 }
        );
    }
}
