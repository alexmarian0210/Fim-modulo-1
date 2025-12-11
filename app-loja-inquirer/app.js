import { select, input, confirm } from '@inquirer/prompts';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do banco de dados
const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

// Função para conectar ao banco
async function conectarDB() {
  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');
  } catch (erro) {
    console.error('❌ Erro ao conectar:', erro.message);
    process.exit(1);
  }
}

// Função para desconectar do banco
async function desconectarDB() {
  try {
    await client.end();
    console.log('✅ Desconectado do banco de dados');
  } catch (erro) {
    console.error('❌ Erro ao desconectar:', erro.message);
  }
}

// Função para adicionar cliente
async function adicionarCliente() {
  try {
    const nome = await input({
      message: 'Nome do cliente:',
      validate: (valor) => {
        if (!valor || valor.trim() === '') {
          return 'Nome é obrigatório';
        }
        if (valor.length < 3) {
          return 'Nome deve ter pelo menos 3 caracteres';
        }
        return true;
      }
    });

    const email = await input({
      message: 'Email do cliente:',
      validate: (valor) => {
        if (!valor || !valor.includes('@')) {
          return 'Email inválido';
        }
        return true;
      }
    });

    const confirmar = await confirm({
      message: `Confirma adicionar cliente ${nome} - ${email}?`
    });

    if (!confirmar) {
      console.log('❌ Operação cancelada');
      return;
    }

    await conectarDB();
    await client.query(
      'INSERT INTO clientes (nome, email) VALUES ($1, $2)',
      [nome, email]
    );

    console.log('✅ Cliente adicionado com sucesso!');
  } catch (erro) {
    console.error('❌ Erro ao adicionar cliente:', erro.message);
  } finally {
    await desconectarDB();
  }
}

// Função para listar clientes
async function listarClientes() {
  try {
    await conectarDB();

    const resultado = await client.query(
      'SELECT id, nome, email FROM clientes ORDER BY nome'
    );

    console.log('\n📋 LISTA DE CLIENTES:');
    console.log('='.repeat(60));

    if (resultado.rows.length === 0) {
      console.log('Nenhum cliente cadastrado');
    } else {
      resultado.rows.forEach(cliente => {
        console.log(`[${cliente.id}] ${cliente.nome} - ${cliente.email}`);
      });
    }

    console.log('='.repeat(60));
  } catch (erro) {
    console.error('❌ Erro ao listar clientes:', erro.message);
  } finally {
    await desconectarDB();
  }
}

// Função para buscar cliente por nome
async function buscarClientePorNome() {
  try {
    const nomeBusca = await input({
      message: 'Digite o nome ou parte do nome para buscar:'
    });

    await conectarDB();

    const resultado = await client.query(
      'SELECT id, nome, email FROM clientes WHERE nome ILIKE $1 ORDER BY nome',
      [`%${nomeBusca}%`]
    );

    console.log(`\n🔍 RESULTADO DA BUSCA POR "${nomeBusca}":`);
    console.log('='.repeat(60));

    if (resultado.rows.length === 0) {
      console.log('Nenhum cliente encontrado');
    } else {
      resultado.rows.forEach(cliente => {
        console.log(`[${cliente.id}] ${cliente.nome} - ${cliente.email}`);
      });
    }

    console.log('='.repeat(60));
  } catch (erro) {
    console.error('❌ Erro ao buscar cliente:', erro.message);
  } finally {
    await desconectarDB();
  }
}

// Função para atualizar cliente
async function atualizarCliente() {
  try {
    const id = await input({
      message: 'Digite o ID do cliente a atualizar:'
    });

    await conectarDB();

    // Verificar se cliente existe
    const clienteExistente = await client.query(
      'SELECT id, nome, email FROM clientes WHERE id = $1',
      [id]
    );

    if (clienteExistente.rows.length === 0) {
      console.log('❌ Cliente não encontrado');
      return;
    }

    const cliente = clienteExistente.rows[0];
    console.log(`Cliente atual: [${cliente.id}] ${cliente.nome} - ${cliente.email}`);

    const novoNome = await input({
      message: 'Novo nome (pressione Enter para manter o atual):',
      default: cliente.nome
    });

    const novoEmail = await input({
      message: 'Novo email (pressione Enter para manter o atual):',
      default: cliente.email,
      validate: (valor) => {
        if (!valor || !valor.includes('@')) {
          return 'Email inválido';
        }
        return true;
      }
    });

    const confirmar = await confirm({
      message: `Confirma atualização para ${novoNome} - ${novoEmail}?`
    });

    if (!confirmar) {
      console.log('❌ Operação cancelada');
      return;
    }

    await client.query(
      'UPDATE clientes SET nome = $1, email = $2 WHERE id = $3',
      [novoNome, novoEmail, id]
    );

    console.log('✅ Cliente atualizado com sucesso!');
  } catch (erro) {
    console.error('❌ Erro ao atualizar cliente:', erro.message);
  } finally {
    await desconectarDB();
  }
}

// Função para deletar cliente
async function deletarCliente() {
  try {
    const id = await input({
      message: 'Digite o ID do cliente a deletar:'
    });

    await conectarDB();

    // Verificar se cliente existe
    const clienteExistente = await client.query(
      'SELECT id, nome, email FROM clientes WHERE id = $1',
      [id]
    );

    if (clienteExistente.rows.length === 0) {
      console.log('❌ Cliente não encontrado');
      return;
    }

    const cliente = clienteExistente.rows[0];
    console.log(`Cliente a deletar: [${cliente.id}] ${cliente.nome} - ${cliente.email}`);

    const confirmar = await confirm({
      message: 'Tem certeza que deseja deletar este cliente? Esta ação não pode ser desfeita!'
    });

    if (!confirmar) {
      console.log('❌ Operação cancelada');
      return;
    }

    await client.query('DELETE FROM clientes WHERE id = $1', [id]);

    console.log('✅ Cliente deletado com sucesso!');
  } catch (erro) {
    console.error('❌ Erro ao deletar cliente:', erro.message);
  } finally {
    await desconectarDB();
  }
}

// Função para adicionar produto
async function adicionarProduto() {
  try {
    const nome = await input({
      message: 'Nome do produto:',
      validate: (valor) => {
        if (!valor || valor.trim() === '') {
          return 'Nome é obrigatório';
        }
        if (valor.length < 2) {
          return 'Nome deve ter pelo menos 2 caracteres';
        }
        return true;
      }
    });

    const preco = await input({
      message: 'Preço do produto (ex: 29.99):',
      validate: (valor) => {
        const num = parseFloat(valor);
        if (isNaN(num) || num <= 0) {
          return 'Preço deve ser um número positivo';
        }
        return true;
      }
    });

    const descricao = await input({
      message: 'Descrição do produto (opcional):'
    });

    const confirmar = await confirm({
      message: `Confirma adicionar produto ${nome} - R$ ${preco}?`
    });

    if (!confirmar) {
      console.log('❌ Operação cancelada');
      return;
    }

    await conectarDB();
    await client.query(
      'INSERT INTO produtos (nome, preco, descricao) VALUES ($1, $2, $3)',
      [nome, parseFloat(preco), descricao || null]
    );

    console.log('✅ Produto adicionado com sucesso!');
  } catch (erro) {
    console.error('❌ Erro ao adicionar produto:', erro.message);
  } finally {
    await desconectarDB();
  }
}

// Função para listar produtos
async function listarProdutos() {
  try {
    await conectarDB();

    const resultado = await client.query(
      'SELECT id, nome, preco, descricao FROM produtos ORDER BY nome'
    );

    console.log('\n📦 LISTA DE PRODUTOS:');
    console.log('='.repeat(60));

    if (resultado.rows.length === 0) {
      console.log('Nenhum produto cadastrado');
    } else {
      resultado.rows.forEach(produto => {
        console.log(`[${produto.id}] ${produto.nome} - R$ ${produto.preco.toFixed(2)}`);
        if (produto.descricao) {
          console.log(`    ${produto.descricao}`);
        }
      });
    }

    console.log('='.repeat(60));
  } catch (erro) {
    console.error('❌ Erro ao listar produtos:', erro.message);
  } finally {
    await desconectarDB();
  }
}

// Função para relatório de vendas (simples, assumindo tabela vendas se existir)
async function relatorioVendas() {
  try {
    await conectarDB();

    // Tentar contar vendas se a tabela existir
    const resultado = await client.query(`
      SELECT COUNT(*) as total_vendas,
             COALESCE(SUM(total), 0) as total_valor
      FROM vendas
    `).catch(() => ({ rows: [{ total_vendas: 0, total_valor: 0 }] }));

    console.log('\n📊 RELATÓRIO DE VENDAS:');
    console.log('='.repeat(60));
    console.log(`Total de vendas: ${resultado.rows[0].total_vendas}`);
    console.log(`Valor total: R$ ${parseFloat(resultado.rows[0].total_valor || 0).toFixed(2)}`);
    console.log('='.repeat(60));
  } catch (erro) {
    console.error('❌ Erro ao gerar relatório:', erro.message);
  } finally {
    await desconectarDB();
  }
}

// Menu de operações de clientes
async function menuClientes() {
  const opcao = await select({
    message: 'OPERAÇÕES DE CLIENTES',
    choices: [
      { name: '1. Adicionar Cliente', value: '1' },
      { name: '2. Listar Clientes', value: '2' },
      { name: '3. Buscar Cliente por Nome', value: '3' },
      { name: '4. Atualizar Cliente', value: '4' },
      { name: '5. Deletar Cliente', value: '5' },
      { name: '6. Voltar ao Menu Principal', value: '6' }
    ]
  });

  switch (opcao) {
    case '1':
      await adicionarCliente();
      break;
    case '2':
      await listarClientes();
      break;
    case '3':
      await buscarClientePorNome();
      break;
    case '4':
      await atualizarCliente();
      break;
    case '5':
      await deletarCliente();
      break;
    case '6':
      return;
  }

  await menuClientes();
}

// Menu de operações de produtos
async function menuProdutos() {
  const opcao = await select({
    message: 'OPERAÇÕES DE PRODUTOS',
    choices: [
      { name: '1. Adicionar Produto', value: '1' },
      { name: '2. Listar Produtos', value: '2' },
      { name: '3. Voltar ao Menu Principal', value: '3' }
    ]
  });

  switch (opcao) {
    case '1':
      await adicionarProduto();
      break;
    case '2':
      await listarProdutos();
      break;
    case '3':
      return;
  }

  await menuProdutos();
}

// Menu principal
async function menuPrincipal() {
  const opcao = await select({
    message: '🏪 SISTEMA DE GERENCIAMENTO DA LOJA',
    choices: [
      { name: '1. Operações de Clientes', value: '1' },
      { name: '2. Operações de Produtos', value: '2' },
      { name: '3. Relatório de Vendas', value: '3' },
      { name: '4. Sair', value: '4' }
    ]
  });

  switch (opcao) {
    case '1':
      await menuClientes();
      break;
    case '2':
      await menuProdutos();
      break;
    case '3':
      await relatorioVendas();
      break;
    case '4':
      console.log('👋 Até logo!');
      return;
  }

  await menuPrincipal();
}

// Função principal
async function main() {
  console.log('🚀 Iniciando aplicação da loja...');
  await menuPrincipal();
}

main().catch(console.error);
