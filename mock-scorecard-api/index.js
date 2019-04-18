const express = require('express')
const scoreSystems = require('./data/scoreSystems.json')
const scorecardDetails = require('./data/scorecardDetails.json')
const app = express()

scorecardDetails.scorecardDetails = []

scoreSystems.forEach(element => {
  scorecardDetails.scorecardDetails.push({
    ...element,
    weight: 100 / scoreSystems.length
  })
})

app.get('/scoreSystems', (req, res) => res.json(scoreSystems))
app.get('/scorecards/:id', (req, res) => res.json(scorecardDetails))

app.listen(process.env.PORT || 4000);
console.log(`Server listening on http://localhost:${process.env.PORT || 4000}`)
