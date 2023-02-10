require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan');
const cors = require('cors')
const Person = require('./models/person');

morgan.token('body', (req, res) =>  JSON.stringify(req.body))
const options = ':method :url :status :res[content-length] - :response-time ms :body'

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(options))
app.use(cors())

app.get('/api/persons', (request, response, error) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    }).catch(error => next(error))
})
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person)
        response.json(person)
      else 
        response.status(404).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body;
  if(body === undefined){
    res.status(400).send({error: 'body cannot be empty'})
  }
  if(!body.name){
    return response.status(400).json({
      error: 'name missing'
    })
  } 
  if(!body.number){
    return response.status(400).json({
      error: 'number missing'
    })
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  })
  person.save()
    .then(savedPerson => response.json(savedPerson))
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {

  Person
    .findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  if(error === 'CastError'){
    return res.status(400).send({error: 'Malformatted id'})
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})