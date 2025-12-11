# Aplicação Loja - Node.js com PostgreSQL

Uma aplicação CLI interativa para gerenciamento de loja com clientes e produtos, desenvolvida com Node.js, PostgreSQL e Docker.

## 🚀 Como executar

### Pré-requisitos
- Docker e Docker Compose instalados

### Passos para executar

1. **Clone ou navegue até o diretório do projeto**
   ```bash
   cd app-loja-inquirer
   ```

2. **Execute com Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Acesse a aplicação**
   - A aplicação estará rodando em: http://localhost:3000
   - Ou use a interface CLI diretamente no terminal do container

### Comandos úteis

```bash
# Executar em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Remover volumes (dados do banco)
docker-compose down -v
```

## 📋 Funcionalidades

- ✅ Menu interativo com seleção visual
- ✅ Gerenciamento de clientes (adicionar, listar, buscar, atualizar, deletar)
- ✅ Gerenciamento de produtos (adicionar, listar)
- ✅ Validação de dados em todos os campos
- ✅ Confirmações para operações críticas
- ✅ Relatório de vendas
- ✅ Tratamento completo de erros

## 🏗️ Arquitetura

- **Node.js** com ES modules
- **PostgreSQL** como banco de dados
- **@inquirer/prompts** para interface CLI
- **Docker** para containerização

## 📁 Estrutura do projeto

```
app-loja-inquirer/
├── app.js              # Aplicação principal
├── setup.js            # Script de configuração do banco
├── test-connection.js  # Teste de conexão
├── schema.sql          # Schema do banco de dados
├── Dockerfile          # Configuração Docker
├── docker-compose.yml  # Orquestração de containers
├── package.json        # Dependências Node.js
└── .env               # Configurações de ambiente
```

## 🗄️ Banco de dados

### Tabelas criadas automaticamente:
- **clientes**: id, nome, email, criado_em
- **produtos**: id, nome, preco, descricao, criado_em
- **vendas**: id, cliente_id, produto_id, quantidade, total, data_venda

## 🔧 Desenvolvimento local

Se preferir executar sem Docker:

1. Instale PostgreSQL localmente
2. Configure o banco "loja"
3. Atualize `.env` para `DB_HOST=localhost`
4. Execute `node setup.js` para criar tabelas
5. Execute `node app.js` para iniciar

## 📝 Checklist de entrega

- ✅ Menu exibindo com select
- ✅ Adicionar cliente funcionando
- ✅ Listar clientes funcionando
- ✅ Adicionar produto funcionando
- ✅ Listar produtos funcionando
- ✅ Validação de dados funcionando
- ✅ Confirmação funcionando
- ✅ Código bem formatado
- ✅ Comentários explicativos
- ✅ Tratamento de erros
- ✅ Conexão fechando corretamente
- ✅ Usando ES modules (import/export)
- ✅ Usando @inquirer/prompts
