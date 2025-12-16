import { select, input, confirm } from '@inquirer/prompts';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ----------------------------------------------------------------------
// CONFIGURAÇÃO BASE DO BANCO DE DADOS (DB_CONFIG)
// ----------------------------------------------------------------------
const DB_CONFIG = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
};

// ----------------------------------------------------------------------
// FUNÇÕES DE CRUD (CLIENTES)
// ----------------------------------------------------------------------

async function adicionarCliente() {
    const client = new Client(DB_CONFIG); 
    
    try {
        const nome = await input({
            message: 'Nome:',
            validate: (v) => v.length >= 3 || 'Mínimo 3 caracteres'
        });
        
        const email = await input({
            message: 'Email:',
            validate: (v) => v.includes('@') || 'Email inválido'
        });
        
        await client.connect();
        await client.query(
            'INSERT INTO clientes (nome, email) VALUES ($1, $2)',
            [nome, email]
        );
        
        console.log('✅ Cliente adicionado com sucesso!');
    } catch (erro) {
        console.error('❌ Erro ao adicionar cliente:', erro.message);
    } finally {
        await client.end();
    }
}

async function listarClientes() {
    const client = new Client(DB_CONFIG);

    try {
        await client.connect(); 

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
        await client.end();
    }
}

async function buscarClientePorNome() {
    const client = new Client(DB_CONFIG);

    try {
        const nomeBusca = await input({
            message: 'Digite o nome ou parte do nome para buscar:'
        });

        await client.connect();

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
        await client.end();
    }
}

async function atualizarCliente() {
    const client = new Client(DB_CONFIG);

    try {
        const id = await input({
            message: 'Digite o ID do cliente a atualizar:'
        });

        await client.connect();

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
            validate: (valor) => valor.includes('@') || 'Email inválido'
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
        await client.end();
    }
}

async function deletarCliente() {
    const client = new Client(DB_CONFIG);

    try {
        const id = await input({
            message: 'Digite o ID do cliente a deletar:'
        });

        await client.connect();

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
        await client.end();
    }
}


// ----------------------------------------------------------------------
// FUNÇÕES DE CRUD (PRODUTOS)
// ----------------------------------------------------------------------

async function adicionarProduto() {
    const client = new Client(DB_CONFIG);

    try {
        const nome = await input({
            message: 'Nome do produto:',
            validate: (valor) => valor.trim().length >= 2 || 'Nome deve ter pelo menos 2 caracteres'
        });

        const preco = await input({
            message: 'Preço do produto (ex: 29.99):',
            validate: (valor) => {
                const num = parseFloat(valor);
                return (isNaN(num) || num <= 0) ? 'Preço deve ser um número positivo' : true;
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

        await client.connect();
        await client.query(
            'INSERT INTO produtos (nome, preco, descricao) VALUES ($1, $2, $3)',
            [nome, parseFloat(preco), descricao || null]
        );

        console.log('✅ Produto adicionado com sucesso!');
    } catch (erro) {
        console.error('❌ Erro ao adicionar produto:', erro.message);
    } finally {
        await client.end();
    }
}

async function listarProdutos() {
    const client = new Client(DB_CONFIG);
    
    try {
        await client.connect();

        const resultado = await client.query(
            'SELECT id, nome, preco, descricao FROM produtos ORDER BY nome'
        );

        console.log('\n📦 LISTA DE PRODUTOS:');
        console.log('='.repeat(60));

        if (resultado.rows.length === 0) {
            console.log('Nenhum produto cadastrado');
        } else {
            resultado.rows.forEach(produto => {
                const precoFormatado = parseFloat(produto.preco).toFixed(2); 
                console.log(`[${produto.id}] ${produto.nome} - R$ ${precoFormatado}`);
                if (produto.descricao) {
                    console.log(`    Descrição: ${produto.descricao}`);
                }
            });
        }

        console.log('='.repeat(60));
    } catch (erro) {
        console.error('❌ Erro ao listar produtos:', erro.message);
    } finally {
        await client.end();
    }
}

// ----------------------------------------------------------------------
// OUTRAS FUNÇÕES
// ----------------------------------------------------------------------

async function relatorioVendas() {
    const client = new Client(DB_CONFIG);
    let resultado = { rows: [{ total_vendas: 0, total_valor: 0 }] };

    try {
        await client.connect();

        try {
            resultado = await client.query(`
                SELECT COUNT(*) as total_vendas,
                       COALESCE(SUM(total), 0) as total_valor
                FROM vendas
            `);
        } catch (queryError) {
            if (queryError.message.includes('relation "vendas" does not exist')) {
                console.log('⚠️ Tabela "vendas" não encontrada. Exibindo zeros.');
            } else {
                throw queryError; 
            }
        }

        console.log('\n📊 RELATÓRIO DE VENDAS:');
        console.log('='.repeat(60));
        console.log(`Total de vendas: ${resultado.rows[0].total_vendas}`);
        console.log(`Valor total: R$ ${parseFloat(resultado.rows[0].total_valor || 0).toFixed(2)}`);
        console.log('='.repeat(60));
    } catch (erro) {
        console.error('❌ Erro ao gerar relatório:', erro.message);
    } finally {
        await client.end();
    }
}

// ----------------------------------------------------------------------
// MENUS
// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------
// INICIALIZAÇÃO
// ----------------------------------------------------------------------

async function main() {
    console.log('🚀 Iniciando aplicação da loja...');
    await menuPrincipal();
}

main().catch(console.error);