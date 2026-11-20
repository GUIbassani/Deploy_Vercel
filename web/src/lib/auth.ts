
import { SignJWT, jwtVerify } from "jose";

const obterChaveSecreta = () => {
    const segredo = process.env.JWT_SECRET;

    if (!segredo || segredo.length < 32) {
        throw new Error(
            "JWT_SECRET não configurado ou muito curto."
        );
    }

    return new TextEncoder().encode(segredo);
};

export interface DadosToken {
    id: number;
    tipoUsuario: "ADMIN" | "DOADOR";
}

export async function gerarToken(dados: DadosToken) {
    return new SignJWT({
        tipoUsuario: dados.tipoUsuario,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(String(dados.id))
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(obterChaveSecreta());
}

export async function verificarToken(token: string): Promise<DadosToken> {
    const { payload } = await jwtVerify(
        token,
        obterChaveSecreta(),
        {
            algorithms: ["HS256"],
        }
    );

    const id = Number(payload.sub);
    const tipoUsuario = payload.tipoUsuario;

    if (
        !Number.isSafeInteger(id) ||
        id <= 0 ||
        (tipoUsuario !== "ADMIN" && tipoUsuario !== "DOADOR")
    ) {
        throw new Error("Token inválido.");
    }

    return {
        id,
        tipoUsuario,
    };
}
