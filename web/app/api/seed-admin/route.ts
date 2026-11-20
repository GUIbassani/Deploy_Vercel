import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // Se o seu projeto usar bcryptjs, troque para "bcryptjs"
import { Usuario, inicializarBanco } from "@/src/models/Index";

export async function GET() {
  try {
    await inicializarBanco();

    const emailAdmin = "admin@alimentatodos.com";
    const existente = await Usuario.findOne({ where: { email: emailAdmin } });

    if (existente) {
      return NextResponse.json({
        mensagem: "Usuário ADMIN já existe.",
        email: emailAdmin,
      });
    }

    const senhaHash = await bcrypt.hash("Admin123!", 10);

    const admin = await Usuario.create({
      nome: "Administrador AlimentaTodos",
      email: emailAdmin,
      senha: senhaHash,
      telefone: "32999999999",
      tipoUsuario: "ADMIN",
    });

    return NextResponse.json(
      {
        mensagem: "Administrador criado com sucesso!",
        id: admin.id,
        email: emailAdmin,
        senha: "Admin123!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    return NextResponse.json(
      { mensagem: "Erro ao criar administrador.", detalhe: String(error) },
      { status: 500 }
    );
  }
}