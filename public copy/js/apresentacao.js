let chartCategoria = null;
let chartPrecoPorCategoria = null;
let chartQuantidadePorCategoria = null;
let chartDestaque = null;

document.addEventListener('DOMContentLoaded', function () {
    carregarDados();
});

async function carregarDados() {
    try {
        const response = await fetch('http://localhost:3000/produtos');
        if (!response.ok) throw new Error('Erro ao carregar produtos');
        
        const produtos = await response.json();
        processarDados(produtos);
    } catch (error) {
        console.error('Erro:', error);
        showToast('❌ Erro ao carregar dados');
    }
}

function processarDados(produtos) {
    // Calcular estatísticas gerais
    atualizarEstatisticas(produtos);
    
    // Preparar dados por categoria
    const dadosPorCategoria = agruparPorCategoria(produtos);
    
    // Criar gráficos
    criarGraficoDistribuicao(dadosPorCategoria);
    criarGraficoPrecoPorCategoria(dadosPorCategoria);
    criarGraficoQuantidadePorCategoria(dadosPorCategoria);
    criarGraficoDestaque(produtos);
}

function atualizarEstatisticas(produtos) {
    const totalProdutos = produtos.length;
    const categorias = new Set(produtos.map(p => p.categoria));
    const precoMedio = (produtos.reduce((sum, p) => sum + p.preco, 0) / totalProdutos).toFixed(2);
    const produtosDestaque = produtos.filter(p => p.destaque).length;

    document.getElementById('totalProdutos').textContent = totalProdutos;
    document.getElementById('totalCategorias').textContent = categorias.size;
    document.getElementById('precoMedio').textContent = `R$ ${precoMedio.replace('.', ',')}`;
    document.getElementById('produtosDestaque').textContent = produtosDestaque;
}

function agruparPorCategoria(produtos) {
    const agrupado = {};
    
    produtos.forEach(produto => {
        if (!agrupado[produto.categoria]) {
            agrupado[produto.categoria] = [];
        }
        agrupado[produto.categoria].push(produto);
    });
    
    return agrupado;
}

function criarGraficoDistribuicao(dadosPorCategoria) {
    const labels = Object.keys(dadosPorCategoria);
    const dados = labels.map(categoria => dadosPorCategoria[categoria].length);
    const cores = gerarCores(labels.length);

    const ctx = document.getElementById('chartCategoria').getContext('2d');
    
    if (chartCategoria) {
        chartCategoria.destroy();
    }
    
    chartCategoria = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dados,
                backgroundColor: cores,
                borderColor: 'white',
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12,
                            weight: 500
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                        }
                    },
                    bodyFont: {
                        family: "'Inter', sans-serif",
                        size: 12
                    }
                }
            }
        }
    });
}

function criarGraficoPrecoPorCategoria(dadosPorCategoria) {
    const labels = Object.keys(dadosPorCategoria);
    const dados = labels.map(categoria => {
        const precos = dadosPorCategoria[categoria].map(p => p.preco);
        return (precos.reduce((a, b) => a + b, 0) / precos.length).toFixed(2);
    });
    
    const ctx = document.getElementById('chartPrecoPorCategoria').getContext('2d');
    
    if (chartPrecoPorCategoria) {
        chartPrecoPorCategoria.destroy();
    }
    
    chartPrecoPorCategoria = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Preço Médio (R$)',
                data: dados,
                backgroundColor: 'rgba(0, 101, 209, 0.8)',
                borderColor: 'rgba(0, 65, 171, 1)',
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: 'rgba(0, 65, 171, 1)'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'R$ ' + parseFloat(context.parsed.x).toFixed(2).replace('.', ',');
                        }
                    },
                    bodyFont: {
                        family: "'Inter', sans-serif"
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2).replace('.', ',');
                        },
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        }
                    }
                },
                y: {
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

function criarGraficoQuantidadePorCategoria(dadosPorCategoria) {
    const labels = Object.keys(dadosPorCategoria);
    const dados = labels.map(categoria => dadosPorCategoria[categoria].length);
    
    const ctx = document.getElementById('chartQuantidadePorCategoria').getContext('2d');
    
    if (chartQuantidadePorCategoria) {
        chartQuantidadePorCategoria.destroy();
    }
    
    chartQuantidadePorCategoria = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade de Produtos',
                data: dados,
                backgroundColor: [
                    'rgba(74, 144, 226, 0.8)',
                    'rgba(0, 101, 209, 0.8)',
                    'rgba(255, 215, 0, 0.8)',
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(244, 67, 54, 0.8)',
                    'rgba(156, 39, 176, 0.8)'
                ],
                borderColor: [
                    'rgba(74, 144, 226, 1)',
                    'rgba(0, 101, 209, 1)',
                    'rgba(255, 179, 0, 1)',
                    'rgba(56, 142, 60, 1)',
                    'rgba(211, 47, 47, 1)',
                    'rgba(123, 31, 162, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: 'rgba(0, 65, 171, 1)'
            }]
        },
        options: {
            indexAxis: 'x',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' produto(s)';
                        }
                    },
                    bodyFont: {
                        family: "'Inter', sans-serif"
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

function criarGraficoDestaque(produtos) {
    const destaque = produtos.filter(p => p.destaque).length;
    const normal = produtos.length - destaque;
    
    const ctx = document.getElementById('chartDestaque').getContext('2d');
    
    if (chartDestaque) {
        chartDestaque.destroy();
    }
    
    chartDestaque = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Em Destaque', 'Normal'],
            datasets: [{
                data: [destaque, normal],
                backgroundColor: [
                    'rgba(255, 215, 0, 0.8)',
                    'rgba(200, 200, 200, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 179, 0, 1)',
                    'rgba(150, 150, 150, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12,
                            weight: 500
                        },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                        }
                    },
                    bodyFont: {
                        family: "'Inter', sans-serif",
                        size: 12
                    }
                }
            }
        }
    });
}

function gerarCores(quantidade) {
    const cores = [
        'rgba(74, 144, 226, 0.8)',
        'rgba(0, 101, 209, 0.8)',
        'rgba(255, 215, 0, 0.8)',
        'rgba(76, 175, 80, 0.8)',
        'rgba(244, 67, 54, 0.8)',
        'rgba(156, 39, 176, 0.8)',
        'rgba(255, 152, 0, 0.8)',
        'rgba(0, 188, 212, 0.8)',
        'rgba(233, 30, 99, 0.8)',
        'rgba(103, 58, 183, 0.8)'
    ];
    
    const coresUsadas = [];
    for (let i = 0; i < quantidade; i++) {
        coresUsadas.push(cores[i % cores.length]);
    }
    return coresUsadas;
}

function showToast(mensagem) {
    const toast = document.getElementById('czToast');
    if (toast) {
        toast.textContent = mensagem;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}
