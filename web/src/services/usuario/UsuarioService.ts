import {
  UsuarioResponseDTO,
  CreateUsuarioDTO,
  UpdateUsuarioDTO,
  CadastroUsuarioResponseDTO,
} from "../../dto/usuario/UsuarioDTO";

const BASE_URL = "/api/usuarios";

async function tratarResposta<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem =
      data?.mensagem || "Erro ao processar requisição de usuário.";
    throw new Error(mensagem);
  }

  return data as T;
}

export const UsuarioService = {
  async listarTodos(): Promise<UsuarioResponseDTO[]> {
    const response = await fetch(BASE_URL);

    return tratarResposta<UsuarioResponseDTO[]>(response);
  },

  async buscarPorId(id: number | string): Promise<UsuarioResponseDTO> {
    const response = await fetch(`${BASE_URL}/${id}`);

    return tratarResposta<UsuarioResponseDTO>(response);
  },

  async criar(
    dados: CreateUsuarioDTO
  ): Promise<CadastroUsuarioResponseDTO> {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    return tratarResposta<CadastroUsuarioResponseDTO>(response);
  },

  async atualizar(
    id: number | string,
    dados: UpdateUsuarioDTO
  ): Promise<UsuarioResponseDTO> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });
    return tratarResposta<UsuarioResponseDTO>(response);
  },

  async remover(id: number | string): Promise<{ mensagem?: string }> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    return tratarResposta<{ mensagem?: string }>(response);
  },
};
