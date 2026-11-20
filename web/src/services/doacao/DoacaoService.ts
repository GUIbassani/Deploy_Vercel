
import {
  CreateDoacaoDTO,
  DoacaoResponseDTO,
  UpdateDoacaoDTO,
} from "../../dto/doacao/DoacaoDTO";

const BASE_URL = "/api/doacao";

async function tratarResposta<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem =
      data?.mensagem || "Erro ao processar requisição de doação.";
    throw new Error(mensagem);
  }

  return data as T;
}

export const DoacaoService = {
  async listarTodos(): Promise<DoacaoResponseDTO[]> {
    const response = await fetch(BASE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return tratarResposta<DoacaoResponseDTO[]>(response);
  },

  async buscarPorId(id: number | string): Promise<DoacaoResponseDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return tratarResposta<DoacaoResponseDTO>(response);
  },

  async criar(dados: CreateDoacaoDTO): Promise<DoacaoResponseDTO> {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });
    return tratarResposta<DoacaoResponseDTO>(response);
  },

  async atualizar(
    id: number | string,
    dados: UpdateDoacaoDTO
  ): Promise<DoacaoResponseDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });
    return tratarResposta<DoacaoResponseDTO>(response);
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
