
import { DoadorResponseDTO } from "../doador/DoadorDTO";

export interface UsuarioResponseDTO {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipoUsuario: "ADMIN" | "DOADOR";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco: string;
}

export interface CadastroUsuarioResponseDTO {
  usuario: UsuarioResponseDTO;
  doador: DoadorResponseDTO;
}

export type UpdateUsuarioDTO = Partial<{
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  tipoUsuario: "ADMIN" | "DOADOR";
}>;
