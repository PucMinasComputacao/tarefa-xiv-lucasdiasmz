document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formCadastro');
    form.addEventListener('submit', handleSubmit);
});

async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const tamanhos = Array.from(document.querySelectorAll('input[name="tamanhos"]:checked'))
        .map(cb => cb.value);

    if (tamanhos.length === 0) {
        showToast('⚠️ Selecione pelo menos um tamanho');
        return;
    }

    const tags = document.getElementById('tags').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

    const novoProduto = {
        id: Date.now(),
        nome: formData.get('nome'),
        descricaoCurta: formData.get('descricaoCurta'),
        descricaoCompleta: formData.get('descricaoCompleta'),
        preco: parseFloat(formData.get('preco')),
        categoria: formData.get('categoria'),
        imagem: formData.get('imagem'),
        tags: tags,
        destaque: formData.get('destaque') === 'on'
    };

    try {
        const response = await fetch('http://localhost:3000/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoProduto)
        });

        if (!response.ok) throw new Error('Erro ao cadastrar produto');

        showToast('✅ Produto cadastrado com sucesso!');
        document.getElementById('formCadastro').reset();
        
        setTimeout(() => {
            window.location.href = 'index.html#produtos';
        }, 1500);
    } catch (error) {
        console.error('Erro:', error);
        showToast('❌ Erro ao cadastrar produto');
    }
}

function showToast(mensagem) {
    const toast = document.getElementById('czToast');
    toast.textContent = mensagem;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
