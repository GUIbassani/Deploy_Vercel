# AlimentaTodos — API RESTful

## Sobre o projeto

O **AlimentaTodos** é um sistema desenvolvido com o objetivo de conectar doadores de alimentos a pessoas e instituições que necessitam de apoio alimentar.

A plataforma busca facilitar o processo de doação e distribuição de alimentos, permitindo o gerenciamento das informações por meio de uma API RESTful, consumida por uma aplicação mobile.

Este projeto foi desenvolvido como parte das atividades acadêmicas das disciplinas de Desenvolvimento Mobile e Web Services.

## Objetivos

- Facilitar o cadastro e gerenciamento de doadores.
- Permitir o cadastro e gerenciamento de alimentos disponíveis para doação.
- Gerenciar as doações realizadas.
- Organizar as informações necessárias para a distribuição dos alimentos.
- Disponibilizar os dados por meio de endpoints RESTful.
- Integrar o backend à aplicação mobile.

## Tecnologias utilizadas

- **Node.js** — ambiente de execução JavaScript.
- **Next.js** — estrutura da aplicação backend.
- **Express** — gerenciamento de requisições HTTP.
- **TypeScript** — tipagem estática.
- **SQLite** — banco de dados relacional.
- **Sequelize** — ORM para comunicação com o banco de dados.
- **bcryptjs** — criptografia de senhas.
- **JWT** — autenticação baseada em tokens.

## Estrutura do projeto

web/
├── app/
│   └── api/
│       ├── alimentos/
│       ├── doacao/
│       ├── doadores/
│       └── usuarios/
├── src/
│   ├── models/
│   ├── services/
│   └── ...
├── package.json
└── ...


## Funcionalidades da API

A API disponibiliza operações para gerenciamento dos principais recursos do sistema:

- Cadastro, consulta, atualização e remoção de alimentos.
- Cadastro, consulta, atualização e remoção de doações.
- Gerenciamento de doadores.
- Gerenciamento de usuários.
- Persistência dos dados utilizando SQLite e Sequelize.

## Endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/alimentos` | Listar alimentos |
| POST | `/api/alimentos` | Cadastrar alimento |
| GET | `/api/alimentos/:id` | Consultar alimento |
| PUT | `/api/alimentos/:id` | Atualizar alimento |
| DELETE | `/api/alimentos/:id` | Remover alimento |
| GET | `/api/doacao` | Listar doações |
| POST | `/api/doacao` | Cadastrar doação |
| GET | `/api/doacao/:id` | Consultar doação |
| PUT | `/api/doacao/:id` | Atualizar doação |
| DELETE | `/api/doacao/:id` | Remover doação |
| GET | `/api/doadores` | Listar doadores |
| GET | `/api/usuarios` | Listar usuários |


## Banco de dados

O projeto utiliza SQLite para persistência dos dados e Sequelize como ORM.

Os modelos representam as entidades do domínio AlimentaTodos, permitindo estruturar e gerenciar as informações do sistema.

## Autenticação

A documentação dos mecanismos de autenticação será complementada conforme a implementação dos fluxos de autenticação local com JWT e OAuth.

## ⚙️ Como executar o projeto

### Pré-requisitos

Antes de executar o projeto, é necessário instalar o Node.js e o npm.

**1. Instalar o Node.js**

Acesse o site oficial:

https://nodejs.org/

- Baixe a versão LTS (recomendada).
- Execute o instalador.
- Durante a instalação, mantenha as opções padrão selecionadas.
- Finalize a instalação.
- Ou execute o comando winget install OpenJS.NodeJS.LTS no powershell como administrador.

O npm é instalado automaticamente junto com o Node.js.

**2. Verificar a instalação**

Abra o terminal (CMD ou PowerShell) e execute:

```bash
node -v
npm -v
```

Se os comandos retornarem os números das versões instaladas, a instalação foi realizada corretamente.

**3. Clonar o repositório**

```bash
git clone URL_DO_REPOSITORIO
```

**4. Acessar a pasta da API**

```bash
cd web
```

**5. Instalar as dependências**

```bash
npm install
```

**6. Configurar as variáveis de ambiente**

Crie um arquivo `.env` na raiz da aplicação e configure as variáveis necessárias para o funcionamento do projeto.

**7. Executar o projeto**

```bash
npm run dev
```

Após iniciar, a aplicação estará disponível no endereço local informado pelo terminal, normalmente:

http://localhost:3000

## Equipe

Renato Flausino Marques
Guilherme Bassani


## Contexto acadêmico

Trabalho Final — DISCIPLINA WEB SERVICES, PORGRAMAÇÃO FULLSTACK e DESENVOLVIMENTO DE APLICATIVOS MÓVEIS

**Instituição:** Faculdades Integradas Vianna Júnior.

**Ano:** 2026.