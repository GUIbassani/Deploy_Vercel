
import {
  CreateDoadorDTO,
  DoadorResponseDTO,
  UpdateDoadorDTO,
} from "../../dto/Doador/DoadorDTO";

const BASE_URL = "/api/doadores";

async function tratarResposta<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem =
      data?.mensagem || "Erro ao processar requisição de doador.";
    throw new Error(mensagem);
  }

  return data as T;
}

export const DoadorService = {
  async listarTodos(): Promise<DoadorResponseDTO[]> {
    const response = await fetch(BASE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return tratarResposta<DoadorResponseDTO[]>(response);
  },

  async buscarPorId(id: number | string): Promise<DoadorResponseDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return tratarResposta<DoadorResponseDTO>(response);
  },

  async criar(dados: CreateDoadorDTO): Promise<DoadorResponseDTO> {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });
    return tratarResposta<DoadorResponseDTO>(response);
  },

  async atualizar(
    id: number | string,
    dados: UpdateDoadorDTO
  ): Promise<DoadorResponseDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });
    return tratarResposta<DoadorResponseDTO>(response);
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
