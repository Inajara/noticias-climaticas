const PORT = process.env.PORT || 8080
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const artigos = []
const fontesNoticias = [
    {
        name: 'thetimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change',
        base: ''
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: ''
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change',
        base: 'https://www.telegraph.co.uk'
    }
]

fontesNoticias.forEach(fonteNoticias => {
    axios.get(fonteNoticias.address)
    .then(response => {
        const html = response.data
        const enderecoReferencia = cheerio.load(html)
        enderecoReferencia('a:contains("climate")', html).each(function(){
            const titulo = enderecoReferencia(this).text()
            const url = enderecoReferencia(this).attr('href')
            artigos.push({
                titulo,
                url: fonteNoticias.base+url,
                source: fonteNoticias.name
            })
        })
    })
})

//definindo porta
const app = express()
app.listen(PORT, () => console.log(`App rodando na porta ${PORT}`))

//rotas
app.get('/', (req, res) => {
    res.json('Bem-vindo ao nosso API de notícias climáticas!')
})

app.get('/noticias', (req, res) => {
    res.json(artigos)
})

app.get('/noticias/:noticiasId', (req, res) => {
    const noticiasId = req.params.noticiasId
    const fonteNoticiaReferencia = fontesNoticias.filter(fonteNoticias => fonteNoticias.name == noticiasId)[0].address
    const fonteNoticiasBase = fontesNoticias.filter(fonteNoticias => fonteNoticias.name == noticiasId[0].base)
    axios.get(fonteNoticiaReferencia)
    .then(response => {
        const html = response.data
        const enderecoReferencia = cheerio.load(html)
        const artigosBuscados = []
        enderecoReferencia('a:contains("climate")', html).each(function(){
            const titulo = enderecoReferencia(this).text()
            const url = enderecoReferencia(this).attr('href')
            artigosBuscados.push({
                titulo,
                url: fonteNoticiasBase+url,
                source: noticiasId
            })
        })
        res.json(artigosBuscados)
    }).catch(err => console.log(err))
})