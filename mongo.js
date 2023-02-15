const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('missing arguments')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.kvp02f5.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    Person
        .find({})
        .then(person => {
            console.log(person)
            mongoose.connection.close()
        })
} else {

    const person = new Person({
        name: process.argv[3], 
        number: process.argv[4],
    })

    person.save().then(result => {
        console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
        mongoose.connection.close()
    })
}
