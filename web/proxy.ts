
import { NextRequest, NextResponse } from "next/server";
import { verificarToken } from "@/src/lib/auth";

import bcrypt from "bcryptjs";

const rotasAdministrativas = [
    "/api/usuarios",
    "/api/doadores",
    "/api/instituicoes",
    "/api/distribuicoes",
];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname === "/api/seed-admin") {
        return NextResponse.next();
    }

    if (pathname.startsWith("/api/cep/")) {
        return NextResponse.next();
    }

    if (request.method === "OPTIONS") {
        return NextResponse.next();
    }

    if (pathname === "/api/auth/login") {
        return NextResponse.next();
    }

    if (
        pathname === "/api/usuarios" &&
        request.method === "POST"
    ) {
        return NextResponse.next();
    }

    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : undefined;

    const token = request.cookies.get("token")?.value || bearerToken;

    if (!token) {
        return NextResponse.json(
            { mensagem: "Autenticação necessária." },
            { status: 401 }
        );
    }

    try {
        const usuario = await verificarToken(token);

        const consultaDoadorMobile =
            pathname === "/api/doadores" &&
            request.method === "GET" &&
            usuario.tipoUsuario === "DOADOR";

        // Permite que ADMIN e DOADOR acessem seu próprio perfil
        const consultaPerfil =
            pathname === "/api/usuarios/perfil";

        const rotaAdministrativa =
            !consultaDoadorMobile &&
            !consultaPerfil &&
            rotasAdministrativas.some(
                (rota) =>
                    pathname === rota ||
                    pathname.startsWith(`${rota}/`)
            );

        if (
            rotaAdministrativa &&
            usuario.tipoUsuario !== "ADMIN"
        ) {
            return NextResponse.json(
                { mensagem: "Acesso permitido somente para administradores." },
                { status: 403 }
            );
        }

        return NextResponse.next();

    } catch (error) {
        console.error("Erro ao validar autenticação:", error);

        const resposta = NextResponse.json(
            { mensagem: "Token inválido ou expirado." },
            { status: 401 }
        );

        resposta.cookies.delete("token");

        return resposta;
    }
}

export const config = {
    matcher: ["/api/:path*"],
};
