// URL "Raw" do seu arquivo CSV no GitHub (corrigida)
const dataUrl = 'https://raw.githubusercontent.com/johnmbf/municipio_limitrofe/main/municipios_limitrofes.csv';

// Variáveis globais
let dadosCompletos = [];
let indiceNmMun = -1;
let indiceNmLim = -1;
let choices; // Variável para armazenar a instância do Choices.js

/**
 * Aguarda o carregamento do DOM para iniciar a aplicação
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa o Choices.js imediatamente
    const select = document.getElementById('municipio-select');
    choices = new Choices(select, {
        placeholderValue: 'Carregando dados...', // Texto enquanto o CSV é baixado
        searchEnabled: true,
        removeItemButton: false, // Não é um campo de multi-seleção
        itemSelectText: 'Pressione para selecionar', // Texto de acessibilidade
        searchPlaceholderValue: 'Digite para pesquisar...', // Texto no campo de busca
    });

    // 2. Inicia o carregamento dos dados
    iniciarAplicacao(select);
});

/**
 * Função principal que carrega e processa os dados.
 */
async function iniciarAplicacao(selectElement) {
    try {
        const response = await fetch(dataUrl);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const csvText = await response.text();
        
        // 3. Processa o CSV
        processarCSV(csvText);
        
        // 4. Popula o dropdown do Choices.js com os dados processados
        popularDropdown(choices);
        
        // 5. Adiciona o "ouvinte" de evento para quando o usuário mudar a seleção
        selectElement.addEventListener('change', (event) => {
            exibirLimites(event.target.value);
        });

    } catch (error)
 {
        console.error('Falha ao carregar ou processar os dados:', error);
        // Informa o erro ao usuário através do Choices.js
        choices.setChoices([
            { value: '', label: 'Erro ao carregar dados', disabled: true }
        ], 'value', 'label', true);
    }
}

/**
 * Processa o texto bruto do CSV (Função sem alteração)
 */
function processarCSV(text) {
    const linhas = text.split(/\r?\n/);
    if (linhas.length === 0) return;

    const cabecalho = linhas[0].split(',');
    indiceNmMun = cabecalho.indexOf('NM_MUN');
    indiceNmLim = cabecalho.indexOf('NM_LIM');

    if (indiceNmMun === -1 || indiceNmLim === -1) {
        console.error('Colunas "NM_MUN" ou "NM_LIM" não encontradas no CSV.');
        return;
    }

    for (let i = 1; i < linhas.length; i++) {
        if (linhas[i].trim() === '') continue; 
        const colunas = linhas[i].split(',');
        dadosCompletos.push({
            municipio: colunas[indiceNmMun],
            limite: colunas[indiceNmLim]
        });
    }
}

/**
 * Popula o menu suspenso (dropdown) usando a API do Choices.js
 */
function popularDropdown(choicesInstance) {
    // Extrai nomes de municípios e cria lista única
    const nomesMunicipios = dadosCompletos.map(item => item.municipio);
    const municipiosUnicos = [...new Set(nomesMunicipios)];
    
    // Ordena alfabeticamente
    municipiosUnicos.sort((a, b) => a.localeCompare(b));

    // Converte o array de strings para o formato de objeto que o Choices.js espera
    // ex: [{ value: 'Pelotas', label: 'Pelotas' }, ...]
    const choicesData = municipiosUnicos
        .filter(municipio => municipio) // Garante que não há valores nulos/vazios
        .map(municipio => ({
            value: municipio,
            label: municipio
        }));
    
    // Adiciona a opção "Selecione..." no início da lista
    choicesData.unshift({
        value: '',
        label: 'Selecione...',
        selected: true,
        placeholder: true
    });

    // 4. Usa a API do Choices.js para definir a lista de opções de uma só vez
    choicesInstance.setChoices(choicesData, 'value', 'label', true);
}

/**
 * Exibe os municípios limítrofes (Função sem alteração)
 */
function exibirLimites(municipioSelecionado) {
    const listaUl = document.getElementById('lista-limites');
    listaUl.innerHTML = '';

    if (!municipioSelecionado) {
        listaUl.innerHTML = '<li>Nenhum município selecionado.</li>';
        return;
    }

    const municipiosLimites = dadosCompletos
        .filter(item => item.municipio === municipioSelecionado)
        .map(item => item.limite);

    if (municipiosLimites.length > 0) {
        municipiosLimites.sort((a, b) => a.localeCompare(b));
        municipiosLimites.forEach(limite => {
            const li = document.createElement('li');
            li.textContent = limite;
            listaUl.appendChild(li);
        });
    } else {
        listaUl.innerHTML = '<li>Não foram encontrados dados de limites para este município.</li>';
    }
}
