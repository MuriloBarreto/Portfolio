async function fazerRequisicao(url) {
    const resposta = await fetch(url);
    if (!resposta.ok) {
        throw new Error(`Erro ao buscar dados: ${resposta.status}`);
    }
    return resposta.json();
}

function criarCardProjeto(repo) {
    const link = repo.homepage || repo.html_url;
    const label = repo.homepage ? 'Ver demo' : 'Ver repositório';
    const card = document.createElement('article');
    card.className = 'project-card';

    card.innerHTML = `
        <div>
            <h3>${repo.name}</h3>
            <p class="project-description">${repo.description || 'Projeto disponível no GitHub.'}</p>
        </div>
        <div class="project-meta">
            <span>${repo.language || 'Sem linguagem definida'}</span>
            <span>★ ${repo.stargazers_count || 0}</span>
        </div>
        <a class="project-link" href="${link}" target="_blank" rel="noreferrer">${label}</a>
    `;

    return card;
}

function ordenarRepositorios(repositorios) {
    return repositorios.sort((a, b) => {
        const aDemo = a.homepage ? 0 : 1;
        const bDemo = b.homepage ? 0 : 1;

        if (aDemo !== bDemo) {
            return aDemo - bDemo;
        }

        return new Date(b.created_at) - new Date(a.created_at);
    });
}

function atualizarControlesPagina(paginaAtual, totalPaginas) {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const paginaAtualLabel = document.getElementById('pagina-atual');

    btnPrev.disabled = paginaAtual <= 1;
    btnNext.disabled = paginaAtual >= totalPaginas;
    paginaAtualLabel.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
}

Promise.all([
    fazerRequisicao('https://api.github.com/users/MuriloBarreto/repos?per_page=100'),
    fazerRequisicao('https://api.github.com/users/MuriloBarreto')
]).then(([repositorios, perfil]) => {
    const projetosContainer = document.querySelector('.projetos-grid');
    const avatar = document.querySelector('.perfil img');
    const heroLink = document.querySelector('.hero-avatar a');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    avatar.src = perfil.avatar_url;
    heroLink.href = perfil.html_url;

    const reposValidos = repositorios
        .filter(repo => !repo.fork)
        .filter(repo => repo.name.toLowerCase() !== 'murilobarreto');

    if (!reposValidos.length) {
        projetosContainer.innerHTML = '<p class="project-description">Nenhum projeto encontrado no GitHub.</p>';
        document.querySelector('.paginacao').style.display = 'none';
        return;
    }

    const reposOrdenados = ordenarRepositorios(reposValidos);
    const itensPorPagina = 6;
    const totalPaginas = Math.max(1, Math.ceil(reposOrdenados.length / itensPorPagina));
    let paginaAtual = 1;

    function renderizarPagina(pagina) {
        projetosContainer.innerHTML = '';
        paginaAtual = Math.max(1, Math.min(pagina, totalPaginas));

        const inicio = (paginaAtual - 1) * itensPorPagina;
        const paginaItems = reposOrdenados.slice(inicio, inicio + itensPorPagina);

        paginaItems.forEach(repo => {
            projetosContainer.appendChild(criarCardProjeto(repo));
        });

        atualizarControlesPagina(paginaAtual, totalPaginas);
    }

    btnPrev.addEventListener('click', () => renderizarPagina(paginaAtual - 1));
    btnNext.addEventListener('click', () => renderizarPagina(paginaAtual + 1));

    renderizarPagina(1);
}).catch(error => {
    console.error(error);
    const projetosContainer = document.querySelector('.projetos-grid');
    projetosContainer.innerHTML = '<p class="project-description">Não foi possível carregar os projetos no momento.</p>';
    document.querySelector('.paginacao').style.display = 'none';
});
