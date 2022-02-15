async function fazerRequisicao(url){
    const data = await fetch(url)
    return await data.json();

}
fazerRequisicao("https://api.github.com/users/MuriloBarreto/repos").then(e => {
    const projetos = document.querySelector('.projects')
    const filtrarHomepage = obj => obj.homepage
    const filtrarName = obj => obj.name != 'MuriloBarreto'
    const addElemento = obj => {
        const elemento = document.createElement('a')
        elemento.href = obj.homepage
        elemento.target = "_blanck"
        elemento.className = 'projeto'

        const i = document.createElement('i');
        i.innerHTML = obj.description
        const p = document.createElement('p')
        p.innerHTML = obj.name

        elemento.appendChild(i)
        elemento.appendChild(p)

        projetos.appendChild(elemento)
    }

    e.filter(filtrarHomepage).filter(filtrarName).forEach(addElemento)
})

fazerRequisicao("https://api.github.com/users/MuriloBarreto").then(e => {
    const perfil = document.querySelector('.perfil img')
    const link = document.querySelector('.perfil a')
    perfil.src = e.avatar_url
    link.href = e.html_url
})
