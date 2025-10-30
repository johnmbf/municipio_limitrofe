// --- IMPORTANTE ---
// Substitua esta URL pela URL "Raw" do seu arquivo CSV no GitHub.
// Veja o Passo 3 nas instruções de hospedagem.
const dataUrl = 'https://raw.githubusercontent.com/johnmbf/municipio_limitrofe/refs/heads/main/municipios_limitrofes.csv';

// Variáveis globais para armazenar os dados e os índices das colunas
let dadosCompletos = [];
let indiceNmMun = -1;
let indiceNmLim = -1;

// Aguarda o carregamento completo do DOM antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    iniciarAplicacao();
});

/**
 * Função principal que inicia o carregamento e processamento dos dados.
 */
async function iniciarAplicacao() {
    const select = document.getElementById('municipio-select');
    try {
        const response = await fetch(dataUrl);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const csvText = await response.text();
        
        processarCSV(csvText);
        popularDropdown(select);
        
        // Adiciona o "ouvinte" de evento para quando o usuário mudar a seleção
        select.addEventListener('change', (event) => {
            exibirLimites(event.target.value);
        });

    } catch (error) {
        console.error('Falha ao carregar ou processar os dados:', error);
        select.innerHTML = '<option value="">Erro ao carregar dados</option>';
    }
}

/**
 * Processa o texto bruto do CSV e o transforma em um array de objetos.
 */
function processarCSV(text) {
    // Divide o texto em linhas, tratando quebras de linha Windows (\r\n) e Unix (\n)
    const linhas = text.split(/\r?\n/);
    
    if (linhas.length === 0) return;

    // Pega a primeira linha como cabeçalho
    const cabecalho = linhas[0].split(',');

    // Encontra os índices das colunas que nos interessam
    indiceNmMun = cabecalho.indexOf('NM_MUN');
    indiceNmLim = cabecalho.indexOf('NM_LIM');

    if (indiceNmMun === -1 || indiceNmLim === -1) {
        console.error('Colunas "NM_MUN" ou "NM_LIM" não encontradas no CSV.');
        return;
    }

    // Processa o restante das linhas
    // Começa do 1 para pular o cabeçalho
    for (let i = 1; i < linhas.length; i++) {
        if (linhas[i].trim() === '') continue; // Pula linhas vazias
        
        const colunas = linhas[i].split(',');
        
        // Adiciona apenas os dados necessários para otimizar a memória
        dadosCompletos.push({
            municipio: colunas[indiceNmMun],
            limite: colunas[indiceNmLim]
        });
    }
}

/**
 * Popula o menu suspenso (dropdown) com a lista única de municípios.
 */
function popularDropdown(selectElement) {
    // Extrai todos os nomes de municípios (NM_MUN)
    const nomesMunicipios = dadosCompletos.map(item => item.municipio);
    
    // Cria um Set para obter valores únicos e converte de volta para Array
    const municipiosUnicos = [...new Set(nomesMunicipios)];
    
    // Ordena alfabeticamente
    municipiosUnicos.sort((a, b) => a.localeCompare(b));

    // Limpa o "Carregando..."
    selectElement.innerHTML = ''; 
    
    // Adiciona a opção padrão
    const optionPadrao = document.createElement('option');
    optionPadrao.value = '';
    optionPadrao.textContent = 'Selecione...';
    selectElement.appendChild(optionPadrao);

    // Adiciona cada município como uma <option>
    municipiosUnicos.forEach(municipio => {
        if (municipio) { // Garante que não está adicionando valores vazios
            const option = document.createElement('option');
            option.value = municipio;
            option.textContent = municipio;
            selectElement.appendChild(option);
        }
    });
}

/**
 * Filtra os dados e exibe os municípios limítrofes para o município selecionado.
 */
function exibirLimites(municipioSelecionado) {
    const listaUl = document.getElementById('lista-limites');
    
    // Limpa a lista anterior
    listaUl.innerHTML = '';

    if (!municipioSelecionado) {
        listaUl.innerHTML = '<li>Nenhum município selecionado.</li>';
        return;
    }

    // Filtra o array de dados completo procurando pelo município selecionado
    const municipiosLimites = dadosCompletos
        .filter(item => item.municipio === municipioSelecionado)
        .map(item => item.limite); // Extrai apenas o nome do município limítrofe

    if (municipiosLimites.length > 0) {
        // Ordena os limítrofes alfabeticamente
        municipiosLimites.sort((a, b) => a.localeCompare(b));

        // Adiciona cada limite como um item de lista
        municipiosLimites.forEach(limite => {
            const li = document.createElement('li');
            li.textContent = limite;
            listaUl.appendChild(li);
        });
    } else {
        listaUl.innerHTML = '<li>Não foram encontrados dados de limites para este município.</li>';
    }
}
