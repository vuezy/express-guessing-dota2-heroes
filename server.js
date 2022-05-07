const express = require('express')
const app = express()
const port = 4600
const axios = require('axios')
const path = require('path')

let highscore = 0
let allowed = false

app.use('/', express.static('./public'))
app.use('/', express.urlencoded({ extended: false }))
app.use('/', express.json())


app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'index.html'))
})

app.post('/', (req, res) => {
  if (req.body.redirect === 'true') {
    allowed = true
    return res.status(302).redirect('/heroes')
  }
  res.status(302).redirect('/')
})

app.get('/heroes', (req, res) => {
  if (allowed) {
    allowed = false
    return res.status(200).sendFile(path.join(__dirname, 'heroes.html'))
  }
  res.status(302).redirect('/')
})

app.get('/heroes/:id', async (req, res) => {
  try {
    const options = {
      method: 'GET',
      url: `https://dota2-heroes.p.rapidapi.com/heroes/english/${req.params.id}`,
      headers: {
        'X-RapidAPI-Host': 'dota2-heroes.p.rapidapi.com',
        'X-RapidAPI-Key': 'YOUR-RapidAPI-KEY'
      }
    }
    
    const response = await axios.request(options)
    const heroesData = await response.data

    // organize required data
    const data = {
      name: heroesData.name_loc.toUpperCase(),
      // fix incorrect url
      hero_img: heroesData.thumb_image.replace('videos', 'images').replace('/renders', ''),
      // get attribute name
      attribute: heroesData.attribute_img.slice(79, 80).toUpperCase() + heroesData.attribute_img.slice(80, -4),
      attribute_img: heroesData.attribute_img,
      abilities: [
        {
          name: heroesData.abilities[0].name_loc,
          img: heroesData.abilities[0].thumb_image
        },
        {
          name: heroesData.abilities[1].name_loc,
          img: heroesData.abilities[1].thumb_image
        },
        {
          name: heroesData.abilities[2].name_loc,
          img: heroesData.abilities[2].thumb_image
        },
        {
          name: heroesData.abilities[3].name_loc,
          img: heroesData.abilities[3].thumb_image
        }
      ]
    }
    
    res.status(200).json(data)
  }
  catch (err) {
    console.log(err)
    res.status(500)
  }
})

app.get('/highscore', (req, res) => {
  res.status(200).json({ success: true, highscore: highscore })
})

app.post('/highscore', (req, res) => {
  if (req.body.highscore > highscore) {
    highscore = req.body.highscore
  }
  res.status(200).json({ success: true })
})

app.get('*', (req, res) => {
  res.status(404).send('<h1>404 Not Found</h1>')
})


app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})