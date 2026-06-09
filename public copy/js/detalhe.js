let produtoAtual = null;
let tamanhoSelecionado = null;
let quantidadeAtual = 1;

document.addEventListener('DOMContentLoaded', function () {
    const idProduto = obterIdDaURL();
    if (!idProduto) { mostrarErro(); return; }
    carregarProduto(idProduto);
});

function obterIdDaURL() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    return isNaN(id) ? null : id;
}

async function carregarProduto(id) {
    try {
        const response = await fetch(`http://localhost:3000/produtos/${id}`);
        if (!response.ok) throw new Error('Produto não encontrado');
        
        const produto = await response.json();
        produtoAtual = produto;
        renderizarProduto(produto);
        renderizarRelacionados(id);
    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        mostrarErro();
    }
}

async function renderizarRelacionados(produtoAtualId) {
    try {
        const response = await fetch('http://localhost:3000/produtos');
        if (!response.ok) throw new Error('Erro ao carregar produtos');
        
        const todosProdutos = await response.json();
        const categoria = produtoAtual.categoria;
        
        const relacionados = todosProdutos.filter(
            p => p.categoria === categoria && p.id !== produtoAtualId
        );
        
        const lista = relacionados.length > 0
            ? relacionados.slice(0, 4)
            : todosProdutos.filter(p => p.id !== produtoAtualId).slice(0, 4);

        if (lista.length === 0) return;

        const grid = document.getElementById('gridRelacionados');
        grid.innerHTML = lista.map(p => `
            <div class="col-sm-6 col-lg-3">
                <div class="product-card">
                    <img src="${p.imagem}" alt="${p.nome}" class="product-image"
                         onerror="this.onerror=null;this.src='https://picsum.photos/seed/${p.id}-rel/400/400';">
                    <div class="product-body">
                        <h5 class="product-name">${p.nome}</h5>
                        <p class="product-description">${p.descricaoCurta}</p>
                        <p class="product-price">R$ ${p.preco.toFixed(2).replace('.', ',')}</p>
                        <a href="detalhe.html?id=${p.id}" class="product-btn d-block text-center text-decoration-none">
                            👁️ Ver Detalhes
                        </a>
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('secaoRelacionados').style.display = 'block';
    } catch (error) {
        console.error('Erro ao carregar relacionados:', error);
    }
}

function renderizarProduto(produto) {
    document.title = `${produto.nome} - Cruzeiro EC`;
    document.getElementById('breadcrumbNome').textContent = produto.nome;

    const img = document.getElementById('detalheImagem');
    img.src = produto.imagem;
    img.alt = produto.nome;
    img.onerror = function () {
        this.onerror = null;
        this.src = `https://picsum.photos/seed/${produto.id}-detail/600/500`;
    };

    document.getElementById('badgeCategoria').textContent = produto.categoria;
    document.getElementById('detalheNome').textContent = produto.nome;
    document.getElementById('detalheCor').textContent = `📦 ${produto.categoria}`;
    document.getElementById('detalhePreco').textContent = produto.preco.toFixed(2).replace('.', ',');
    document.getElementById('detalheDescricao').textContent = produto.descricaoCompleta;

    renderizarTags(produto.tags);
    renderizarSpecs(produto);

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('produtoDetalhe').style.display = 'block';
}

function renderizarTags(tags) {
    const container = document.getElementById('tagsContainer');
    if (container) {
        container.innerHTML = tags.map(tag => `<span class="badge bg-info ms-1">${tag}</span>`).join('');
    }
}

function renderizarSpecs(produto) {
    const grid = document.getElementById('specsGrid');
    const specs = [
        { label: 'Categoria', value: produto.categoria },
        { label: 'Preço', value: `R$ ${produto.preco.toFixed(2).replace('.', ',')}` },
        { label: 'ID', value: `CRU-${String(produto.id).padStart(4, '0')}` },
        { label: 'Destaque', value: produto.destaque ? 'Sim' : 'Não' },
    ];
    grid.innerHTML = specs.map(s => `
        <div class="spec-item">
            <div class="spec-label">${s.label}</div>
            <div class="spec-value">${s.value}</div>
        </div>
    `).join('');
}

function adicionarAoCarrinho() {
    if (!produtoAtual) return;

    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const itemExistente = carrinho.find(item => item.id === produtoAtual.id);
    
    if (itemExistente) {
        itemExistente.quantidade += quantidadeAtual;
    } else {
        carrinho.push({
            id: produtoAtual.id,
            nome: produtoAtual.nome,
            preco: produtoAtual.preco,
            imagem: produtoAtual.imagem,
            quantidade: quantidadeAtual
        });
    }
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    showToast(`✅ ${produtoAtual.nome} adicionado ao carrinho!`);
}

function changeQty(delta) {
    quantidadeAtual = Math.max(1, quantidadeAtual + delta);
    document.getElementById('qtyValue').textContent = quantidadeAtual;
}

function mostrarErro() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('erroState').style.display = 'block';
}

function showToast(mensagem) {
    const toast = document.getElementById('czToast');
    toast.textContent = mensagem;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
