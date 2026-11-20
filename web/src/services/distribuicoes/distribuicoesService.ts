
import {
  CreateDistribuicaoDTO,
  DistribuicaoResponseDTO,
  UpdateDistribuicaoDTO,
} from "../../dto/distribuicoes/DistribuicaoDTO";

const BASE_URL = "/api/distribuicoes";

async function tratarResposta<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem =
      data?.mensagem || "Erro ao processar requisição de distribuição.";
    throw new Error(mensagem);
  }

  return data as T;
}

export const DistribuicaoService = {
  async listarTodos(): Promise<DistribuicaoResponseDTO[]> {
    const response = await fetch(BASE_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return tratarResposta<DistribuicaoResponseDTO[]>(response);
  },

  async buscarPorId(id: number | string): Promise<DistribuicaoResponseDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return tratarResposta<DistribuicaoResponseDTO>(response);
  },

  async criar(dados: CreateDistribuicaoDTO): Promise<DistribuicaoResponseDTO> {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    return tratarResposta<DistribuicaoResponseDTO>(response);
  },

  async atualizar(
    id: number | string,
    dados: UpdateDistribuicaoDTO
  ): Promise<DistribuicaoResponseDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    return tratarResposta<DistribuicaoResponseDTO>(response);
  },

  async remover(id: number | string): Promise<{ mensagem?: string }> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    return tratarResposta<{ mensagem?: string }>(response);
  },
};
