const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGO_URI

mongoose.connect(url)
  .then(() => {
    console.log('connected successfully to mongodb')
  }).catch(error => console.log(error))

const personSchema = new mongoose.Schema({
  name: String, 
  number: String
})

personSchema.set('toJSON', {
  transform: (doc, retObj) => {
    retObj.id = doc._id.toString()
    delete retObj._id
    delete retObj.__v
  }
  
})


module.exports = new mongoose.model('Person', personSchema)