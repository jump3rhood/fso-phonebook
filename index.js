const express = require('express')
const app = express()
const morgan = require('morgan');
//middleware
app.use(express.json())
app.use(morgan('tiny'))
let persons = [
  { name: 'Arto Hellas', number: '040-123456', id: 1 },
  { name: 'Ada Lovelace', number: '39-44-5323523', id: 2 },
  { name: 'Dan Abramov', number: '12-43-234345', id: 3 },
  { name: 'Mary Poppendieck', number: '39-23-6423122', id: 4 }
]
const generateId = () => {
  const maxId = persons.length > 0 
    ? Math.floor(Math.random()*1000000)
    : 0;
  return maxId + 1;
}

app.get('/', (request, response) => {
  response.send('Phonebook backend')
})
app.get('/info', (request, response) => {
  response.send(`Phonebook has info for ${persons.length} people. ${new Date().toUTCString()}`)
})
app.get('/api/persons', (request, response) => {
  response.json(persons)
})
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if(person){
    response.send(person)
  } else {
    response.status(404).end()
  }
})
app.post('/api/persons', (request, response) => {
  const body = request.body;
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
  const person ={
    name: body.name,
    number: body.number,
    id: generateId()
  }
  persons = persons.concat(person)
  response.send(person)
})
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})