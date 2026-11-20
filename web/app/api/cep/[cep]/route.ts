
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cep: string }> }
) {
  try {
    const { cep } = await params;

    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return NextResponse.json(
        { mensagem: 'CEP deve conter 8 dígitos.' },
        { status: 400 }
      );
    }

    const resposta = await fetch(
      `https://brasilapi.com.br/api/cep/v2/${cepLimpo}`,
      {
        cache: 'no-store',
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      return NextResponse.json(
        {
          mensagem: dados.message || 'CEP não encontrado.',
        },
        { status: resposta.status }
      );
    }

    return NextResponse.json({
      cep: dados.cep,
      rua: dados.street,
      bairro: dados.neighborhood,
      cidade: dados.city,
      estado: dados.state,
    });
  } catch (error) {
    console.error('Erro ao consultar BrasilAPI:', error);

    return NextResponse.json(
      { mensagem: 'Erro ao consultar serviço de CEP.' },
      { status: 500 }
    );
  }
}
