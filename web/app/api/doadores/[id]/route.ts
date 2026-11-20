import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    Doador,
    Usuario,
    inicializarBanco,
} from "@/src/models";
import { verificarToken } from "@/src/lib/auth";

type Params = {
    params: Promise<{ id: string }>;
};

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

export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        const autenticacao = await verificarAdministrador(request);

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
                { mensagem: "ID do doador inválido." },
                { status: 400 }
            );
        }

        const doador = await Doador.findByPk(id);

        if (!doador) {
            return NextResponse.json(
                { mensagem: "Doador não encontrado." },
                { status: 404 }
            );
        }

        return NextResponse.json(doador, { status: 200 });

    } catch (error) {
        console.error("Erro ao buscar doador:", error);

        return NextResponse.json(
            { mensagem: "Erro ao buscar doador." },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: Params
) {
    try {
        const autenticacao = await verificarAdministrador(request);

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
                { mensagem: "ID do doador inválido." },
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

        const doador = await Doador.findByPk(id);

        if (!doador) {
            return NextResponse.json(
                { mensagem: "Doador não encontrado." },
                { status: 404 }
            );
        }

        const {
            usuarioId,
            razaoSocial,
            nomeFantasia,
            cnpj,
            endereco,
        } = dados;

        const atualizacao: {
            usuarioId?: number;
            razaoSocial?: string;
            nomeFantasia?: string;
            cnpj?: string;
            endereco?: string;
        } = {};

        if (usuarioId !== undefined) {
            const idUsuario = Number(usuarioId);

            if (
                usuarioId === null ||
                usuarioId === "" ||
                !Number.isSafeInteger(idUsuario) ||
                idUsuario <= 0
            ) {
                return NextResponse.json(
                    { mensagem: "ID do usuário inválido." },
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

            atualizacao.usuarioId = idUsuario;
        }

        if (razaoSocial !== undefined) {
            if (
                typeof razaoSocial !== "string" ||
                !razaoSocial.trim()
            ) {
                return NextResponse.json(
                    { mensagem: "Razão social inválida." },
                    { status: 400 }
                );
            }

            atualizacao.razaoSocial = razaoSocial.trim();
        }

        if (nomeFantasia !== undefined) {
            if (
                typeof nomeFantasia !== "string" ||
                !nomeFantasia.trim()
            ) {
                return NextResponse.json(
                    { mensagem: "Nome fantasia inválido." },
                    { status: 400 }
                );
            }

            atualizacao.nomeFantasia = nomeFantasia.trim();
        }

        if (cnpj !== undefined) {
            if (
                typeof cnpj !== "string" ||
                !cnpj.trim()
            ) {
                return NextResponse.json(
                    { mensagem: "CNPJ inválido." },
                    { status: 400 }
                );
            }

            atualizacao.cnpj = cnpj.trim();
        }

        if (endereco !== undefined) {
            if (
                typeof endereco !== "string" ||
                !endereco.trim()
            ) {
                return NextResponse.json(
                    { mensagem: "Endereço inválido." },
                    { status: 400 }
                );
            }

            atualizacao.endereco = endereco.trim();
        }

        if (Object.keys(atualizacao).length === 0) {
            return NextResponse.json(
                { mensagem: "Informe pelo menos um campo para atualizar." },
                { status: 400 }
            );
        }

        await doador.update(atualizacao);

        return NextResponse.json(doador, { status: 200 });

    } catch (error) {
        console.error("Erro ao atualizar doador:", error);

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
            { mensagem: "Erro ao atualizar doador." },
            { status: 500 }
        );
    }
}



export async function DELETE(
    request: Request,
    { params }: Params
) {
    try {
        const autenticacao = await verificarAdministrador(request);

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
                { mensagem: "ID do doador inválido." },
                { status: 400 }
            );
        }

        const doador = await Doador.findByPk(id);

        if (!doador) {
            return NextResponse.json(
                { mensagem: "Doador não encontrado." },
                { status: 404 }
            );
        }

        await doador.destroy();

        return NextResponse.json(
            { mensagem: "Doador excluído com sucesso." },
            { status: 200 }
        );

    } catch (error) {
        console.error("Erro ao excluir doador:", error);

        const erro = error as { name?: string };

        if (
            erro.name === "SequelizeForeignKeyConstraintError"
        ) {
            return NextResponse.json(
                {
                    mensagem:
                        "Não é possível excluir este doador porque existem registros vinculados a ele.",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { mensagem: "Erro ao excluir doador." },
            { status: 500 }
        );
    }
}