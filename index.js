require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan');
const cors = require('cors')
const Person = require('./models/person');

morgan.token('body', (req, res) =>  JSON.stringify(req.body))
const options = ':method :url :status :res[content-length] - :response-time ms :body'

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(options))

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
  const body = request.body

  if(body === undefined){
    response.status(400).send({error: 'body cannot be empty'})
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
  Person
    .findOne({ name: body.name })
    .then(found => {
    console.log('searching for person object with the body.name')
      if(found){
        return response.status(400).json({ error : `Person already exists with the name, ${found.name}`})
      }
    }).catch(error  => next(error))
  const person = new Person({
    name: body.name,
    number: body.number,
  })
  person.save()
    .then(savedPerson => {
      console.log('Created new ', savedPerson)
      response.json(savedPerson)
    })
    .catch(error => next(error))
  // Person
  //   .findOne({name : body.name})
  //   .then(found => {
  //     console.log('searching for person object with the body.name')
  //     if(found){
  //       console.log("Found", found)
  //       Person.findByIdAndUpdate(found.id, {
  //         name: found.name,
  //         number: body.number
  //       }, { new : true })
  //       .then(updatedPerson => {
  //         return response.json(updatedPerson)
  //       }).catch(error => next(error))
  //     } else {
  //       console.log('Not found. trying to post..')
  //       const person = new Person({
  //         name: body.name,
  //         number: body.number,
  //       })
  //       person.save()
  //         .then(savedPerson => {
  //           console.log('Created new ', savedPerson)
  //           response.json(savedPerson)
  //         })
  //         .catch(error => next(error))
  //     }
  //   }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;
  const person = { name: body.name, number: body.number }
  Person.findByIdAndUpdate(request.params.id, person, { new : true, runValidator: true, context: 'query' })
  .then(updatedPerson => response.json(updatedPerson))
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

const errorHandler = (error, req, res, next) => {
  console.log("Error: ",error)
  if(error.name === 'CastError'){
    return res.status(400).send({error: 'Malformatted id'})
  }
  if(error.name === 'ValidationError'){
    return res.status(400).json( {error: error.message})
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})