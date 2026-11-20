import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Op } from "sequelize";

import {
    Usuario,
    Doador,
    inicializarBanco,
} from "@/src/models/Index";

import { verificarToken } from "@/src/lib/auth";

async function obterToken(request: Request) {
    const cookieToken = (await cookies()).get("token")?.value;

    const authorization = request.headers.get("Authorization");

    const bearerToken = authorization?.startsWith("Bearer ")
        ? authorization.substring(7)
        : undefined;

    return bearerToken || cookieToken;
}

async function autenticar(request: Request) {
    const token = await obterToken(request);

    if (!token) {
        return {
            erro: NextResponse.json(
                { mensagem: "Autenticação necessária." },
                { status: 401 }
            ),
        };
    }

    try {
        const dadosToken = await verificarToken(token);

        const usuario = await Usuario.findByPk(dadosToken.id);

        if (!usuario) {
            return {
                erro: NextResponse.json(
                    { mensagem: "Usuário não encontrado." },
                    { status: 404 }
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

export async function GET(request: Request) {
    try {
        await inicializarBanco();

        const resultado = await autenticar(request);

        if ("erro" in resultado) {
            return resultado.erro;
        }

        const usuario = resultado.usuario;

        const resposta: any = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone,
            tipoUsuario: usuario.tipoUsuario,
        };

        if (usuario.tipoUsuario === "DOADOR") {
            const doador = await Doador.findOne({
                where: {
                    usuarioId: usuario.id,
                },
            });

            resposta.doador = doador
                ? {
                    id: doador.id,
                    usuarioId: doador.usuarioId,
                    razaoSocial: doador.razaoSocial,
                    nomeFantasia: doador.nomeFantasia,
                    cnpj: doador.cnpj,
                    endereco: doador.endereco,
                }
                : null;
        }

        return NextResponse.json(resposta, {
            status: 200,
        });

    } catch (error) {
        console.error("Erro ao buscar perfil:", error);

        return NextResponse.json(
            { mensagem: "Erro ao buscar perfil." },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        await inicializarBanco();

        const resultado = await autenticar(request);

        if ("erro" in resultado) {
            return resultado.erro;
        }

        const usuario = resultado.usuario;

        const dados = await request.json();

        const {
            nome,
            email,
            telefone,
            razaoSocial,
            nomeFantasia,
            cnpj,
            endereco,
        } = dados;

        if (
            nome !== undefined &&
            (typeof nome !== "string" || !nome.trim())
        ) {
            return NextResponse.json(
                { mensagem: "Nome inválido." },
                { status: 400 }
            );
        }

        if (
            email !== undefined &&
            (typeof email !== "string" || !email.trim())
        ) {
            return NextResponse.json(
                { mensagem: "E-mail inválido." },
                { status: 400 }
            );
        }

        if (
            telefone !== undefined &&
            typeof telefone !== "string"
        ) {
            return NextResponse.json(
                { mensagem: "Telefone inválido." },
                { status: 400 }
            );
        }

        const emailNormalizado =
            email !== undefined
                ? email.trim().toLowerCase()
                : usuario.email;

        if (
            email !== undefined &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)
        ) {
            return NextResponse.json(
                { mensagem: "Informe um e-mail válido." },
                { status: 400 }
            );
        }

        if (email !== undefined) {
            const emailExistente = await Usuario.findOne({
                where: {
                    email: emailNormalizado,
                    id: {
                        [Op.ne]: usuario.id,
                    },
                },
            });

            if (emailExistente) {
                return NextResponse.json(
                    { mensagem: "Este e-mail já está sendo utilizado." },
                    { status: 409 }
                );
            }
        }

        await usuario.update({
            ...(nome !== undefined && {
                nome: nome.trim(),
            }),
            ...(email !== undefined && {
                email: emailNormalizado,
            }),
            ...(telefone !== undefined && {
                telefone: telefone.trim(),
            }),
        });

        if (usuario.tipoUsuario === "DOADOR") {
            const doador = await Doador.findOne({
                where: {
                    usuarioId: usuario.id,
                },
            });

            if (!doador) {
                return NextResponse.json(
                    {
                        mensagem:
                            "Dados do estabelecimento não encontrados.",
                    },
                    { status: 404 }
                );
            }

            if (
                razaoSocial !== undefined &&
                (typeof razaoSocial !== "string" ||
                    !razaoSocial.trim())
            ) {
                return NextResponse.json(
                    { mensagem: "Razão social inválida." },
                    { status: 400 }
                );
            }

            if (
                nomeFantasia !== undefined &&
                typeof nomeFantasia !== "string"
            ) {
                return NextResponse.json(
                    { mensagem: "Nome fantasia inválido." },
                    { status: 400 }
                );
            }

            if (
                cnpj !== undefined &&
                typeof cnpj !== "string"
            ) {
                return NextResponse.json(
                    { mensagem: "CNPJ inválido." },
                    { status: 400 }
                );
            }

            if (
                endereco !== undefined &&
                (typeof endereco !== "string" ||
                    !endereco.trim())
            ) {
                return NextResponse.json(
                    { mensagem: "Endereço inválido." },
                    { status: 400 }
                );
            }

            await doador.update({
                ...(razaoSocial !== undefined && {
                    razaoSocial: razaoSocial.trim(),
                }),
                ...(nomeFantasia !== undefined && {
                    nomeFantasia: nomeFantasia.trim(),
                }),
                ...(cnpj !== undefined && {
                    cnpj: cnpj.replace(/\D/g, ""),
                }),
                ...(endereco !== undefined && {
                    endereco: endereco.trim(),
                }),
            });
        }

        const resposta: any = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone,
            tipoUsuario: usuario.tipoUsuario,
        };

        if (usuario.tipoUsuario === "DOADOR") {
            const doadorAtualizado = await Doador.findOne({
                where: {
                    usuarioId: usuario.id,
                },
            });

            resposta.doador = doadorAtualizado
                ? {
                    id: doadorAtualizado.id,
                    usuarioId: doadorAtualizado.usuarioId,
                    razaoSocial: doadorAtualizado.razaoSocial,
                    nomeFantasia: doadorAtualizado.nomeFantasia,
                    cnpj: doadorAtualizado.cnpj,
                    endereco: doadorAtualizado.endereco,
                }
                : null;
        }

        return NextResponse.json(
            {
                mensagem: "Perfil atualizado com sucesso.",
                perfil: resposta,
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Erro ao atualizar perfil:", error);

        if (error.name === "SequelizeUniqueConstraintError") {
            return NextResponse.json(
                { mensagem: "Este e-mail já está sendo utilizado." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { mensagem: "Erro ao atualizar perfil." },
            { status: 500 }
        );
    }
}