
import {
  CreateInstituicaoDTO,
  InstituicaoResponseDTO,
  UpdateInstituicaoDTO,
} from "../../dto/instituicao/InstituicaoDTO";

const BASE_URL = "/api/instituicoes";

async function tratarResposta<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem =
      data?.mensagem || "Erro ao processar requisição de instituição.";
    throw new Error(mensagem);
  }

  return data as T;
}

export const InstituicaoService = {
  async listarTodos(): Promise<InstituicaoResponseDTO[]> {
    const response = await fetch(BASE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return tratarResposta<InstituicaoResponseDTO[]>(response);
  },

  async buscarPorId(id: number | string): Promise<InstituicaoResponseDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return tratarResposta<InstituicaoResponseDTO>(response);
  },

  async criar(dados: CreateInstituicaoDTO): Promise<InstituicaoResponseDTO> {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });
    return tratarResposta<InstituicaoResponseDTO>(response);
  },

  async atualizar(
    id: number | string,
    dados: UpdateInstituicaoDTO
  ): Promise<InstituicaoResponseDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });
    return tratarResposta<InstituicaoResponseDTO>(response);
  },

  async remover(id: number | string): Promise<{ mensagem?: string }> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return tratarResposta<{ mensagem?: string }>(response);
  },
};
