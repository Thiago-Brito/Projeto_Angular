# BancaZapp

Este projeto foi gerado usando [Angular CLI](https://github.com/angular/angular-cli) versão 19.1.8.

## 🚀 Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [npm](https://www.npmjs.com/) (vem junto com o Node)

## 📦 Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/bancaZapp.git
cd bancaZapp
npm install
```

## ▶️ Servidor de Desenvolvimento (Frontend)

Para iniciar o servidor Angular local:

```bash
npm run start
```

Depois abra o navegador em [http://localhost:4200/](http://localhost:4200/).  
A aplicação será recarregada automaticamente sempre que você modificar algum arquivo.

## 🗄️ Servidor Backend (API Fake)

Este projeto usa o [json-server](https://github.com/typicode/json-server) para simular uma API REST.

Para iniciar o backend local:

```bash
npm run server
```

Por padrão, o backend ficará disponível em:  
[http://localhost:3000/](http://localhost:3000/)

### Rotas disponíveis:
- `GET /produtos`
- `POST /produtos`
- `PUT /produtos/:id`
- `DELETE /produtos/:id`
- `GET /categorias`
