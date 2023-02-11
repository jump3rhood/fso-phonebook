const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGO_URI

mongoose.connect(url)
  .then(() => {
    console.log('connected successfully to mongodb')
  }).catch(error => console.log(error))

const personSchema = new mongoose.Schema({
  name: {
  type: String,
  minLength: 3,
  required: true
  }, 
  number: {
    type: String,
    minLength: 8,
    validate : {
        validator: function(v){
            return /^\d{2,3}-\d{5,}$/.test(v);
        },
        message: props => `${props.value} is not a valid phonenumber. Valid ex: 09-1234556 and 040-22334455`
    },
    required: true
}
})

personSchema.set('toJSON', {
  transform: (doc, retObj) => {
    retObj.id = doc._id.toString()
    delete retObj._id
    delete retObj.__v
  }
  
})


module.exports = new mongoose.model('Person', personSchema)