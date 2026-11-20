export const API_URL = "http://192.168.2.109:3000/api";

function montarHeaders(token?: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function tratarResposta<T>(
  response: Response,
  mensagemPadrao: string
): Promise<T> {
  const texto = await response.text();

  let data: any = null;

  try {
    data = texto ? JSON.parse(texto) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.log("Resposta de erro da API:", response.status, texto);

    throw new Error(
      data?.mensagem ||
        data?.error ||
        `${mensagemPadrao} (Status ${response.status})`
    );
  }

  return data as T;
}

export interface PerfilResponse {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipoUsuario: "ADMIN" | "DOADOR";

  doador?: {
    id: number;
    usuarioId: number;
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    endereco: string;
  } | null;
}

export async function listar<T = any>(
  recurso: string,
  token?: string
): Promise<T[]> {
  const response = await fetch(`${API_URL}/${recurso}`, {
    method: "GET",
    headers: montarHeaders(token),
  });

  return tratarResposta<T[]>(
    response,
    "Erro ao buscar registros."
  );
}

export async function buscar<T = any>(
  recurso: string,
  id: number | string,
  token?: string
): Promise<T> {
  const response = await fetch(`${API_URL}/${recurso}/${id}`, {
    method: "GET",
    headers: montarHeaders(token),
  });

  return tratarResposta<T>(
    response,
    "Erro ao buscar registro."
  );
}

export async function buscarPerfil(
  token: string
): Promise<PerfilResponse> {
  const response = await fetch(`${API_URL}/usuarios/perfil`, {
    method: "GET",
    headers: montarHeaders(token),
  });

  return tratarResposta<PerfilResponse>(
    response,
    "Erro ao buscar perfil."
  );
}

export async function cadastrar<T = any>(
  recurso: string,
  dados: any,
  token?: string
): Promise<T> {
  const response = await fetch(`${API_URL}/${recurso}`, {
    method: "POST",
    headers: montarHeaders(token),
    body: JSON.stringify(dados),
  });

  return tratarResposta<T>(
    response,
    "Erro ao cadastrar registro."
  );
}

export async function atualizar<T = any>(
  recurso: string,
  id: number | string,
  dados: any,
  token?: string
): Promise<T> {
  const response = await fetch(`${API_URL}/${recurso}/${id}`, {
    method: "PUT",
    headers: montarHeaders(token),
    body: JSON.stringify(dados),
  });

  return tratarResposta<T>(
    response,
    "Erro ao atualizar registro."
  );
}

export async function atualizarParcial<T = any>(
  recurso: string,
  id: number | string,
  dados: any,
  token?: string
): Promise<T> {
  const response = await fetch(`${API_URL}/${recurso}/${id}`, {
    method: "PATCH",
    headers: montarHeaders(token),
    body: JSON.stringify(dados),
  });

  return tratarResposta<T>(response, "Erro ao atualizar registro.");
}
export async function patch<T = any>(
  recurso: string,
  id: number | string,
  dados: any,
  token?: string
): Promise<T> {
  const response = await fetch(`${API_URL}/${recurso}/${id}`, {
    method: "PATCH",
    headers: montarHeaders(token),
    body: JSON.stringify(dados),
  });

  return tratarResposta<T>(
    response,
    "Erro ao atualizar registro."
  );
}

export async function excluir<T = any>(
  recurso: string,
  id: number | string,
  token?: string
): Promise<T> {
  const response = await fetch(`${API_URL}/${recurso}/${id}`, {
    method: "DELETE",
    headers: montarHeaders(token),
  });

  return tratarResposta<T>(
    response,
    "Erro ao excluir registro."
  );
}

export interface AtualizarPerfilRequest {
  nome: string;
  email: string;
  telefone: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  cnpj?: string;
  endereco?: string;
}

export async function atualizarPerfil(
  dados: AtualizarPerfilRequest,
  token: string
): Promise<PerfilResponse> {
  const response = await fetch(`${API_URL}/usuarios/perfil`, {
    method: "PATCH",
    headers: montarHeaders(token),
    body: JSON.stringify(dados),
  });

  return tratarResposta<PerfilResponse>(
    response,
    "Erro ao atualizar perfil."
  );

  
}

export interface EnderecoCEP {
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export async function consultarCEP(cep: string): Promise<EnderecoCEP> {
  const cepLimpo = cep.replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    throw new Error("Informe um CEP válido com 8 dígitos.");
  }

  const response = await fetch(`${API_URL}/cep/${cepLimpo}`, {
    method: "GET",
    headers: montarHeaders(),
  });

  return tratarResposta<EnderecoCEP>(
    response,
    "Erro ao consultar CEP."
  );
}
