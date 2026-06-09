async function fetchProdutos() {
    try {
        const response = await fetch('http://localhost:3000/produtos');
        if (!response.ok) throw new Error('Erro ao carregar produtos');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        showToast('❌ Erro ao carregar produtos');
        return [];
    }
}

function createCard(produto) {
    return `
        <div class="col-sm-6 col-lg-3">
            <div class="product-card">
                <a href="detalhe.html?id=${produto.id}" style="display:block;">
                    <img src="${produto.imagem}" alt="${produto.nome}" class="product-image"
                         onerror="this.onerror=null;this.src='https://picsum.photos/seed/${produto.id}-fallback/400/400';">
                </a>
                <div class="product-body">
                    <h5 class="product-name">${produto.nome}</h5>
                    <p class="product-description">${produto.descricaoCurta}</p>
                    <p class="product-price">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                    <a href="detalhe.html?id=${produto.id}" class="product-btn d-block text-center text-decoration-none">
                        Ver Detalhes
                    </a>
                </div>
            </div>
        </div>
    `;
}

function renderCards(produtos) {
    const gridProdutos = document.getElementById('gridProdutos');
    gridProdutos.innerHTML = '';
    
    if (produtos.length === 0) {
        gridProdutos.innerHTML = '<div class="col-12"><p class="alert alert-info">Nenhum produto encontrado</p></div>';
        return;
    }
    
    produtos.forEach(produto => {
        gridProdutos.innerHTML += createCard(produto);
    });
}

async function init() {
    const produtos = await fetchProdutos();
    renderCards(produtos);
}

function showToast(mensagem) {
    const toast = document.getElementById('czToast');
    if (toast) {
        toast.textContent = mensagem;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

document.addEventListener('DOMContentLoaded', init);
