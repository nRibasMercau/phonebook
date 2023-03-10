require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

morgan.token('person', function getReqBody (request) {
    return JSON.stringify(request.body)
})

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(morgan(':person'))
app.use(express.static('build'))


app.get('/', (request, response) => {
    response.send('<h1>Phonebook App</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})

/*
app.get('/api/info', (request, response) => {
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>`
    )
})
*/

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404)
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))

})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }
    /*
    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name already exists in db, names must be unique'
        })
    }
    */
    const person = new Person ({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))

    /*
    Person.find({ name: body.name })
        .then(person => {
            console.log(person)
            if (person) {
                response.status(400).json({ error: 'name already exists in db, names must be unique man!!' }).end()
            } else {

                const person = new Person ({
                    name: body.name,
                    number: body.number,
                })

                person.save()
                    .then(savedPerson => {
                        response.json(savedPerson)
                    })
                    .catch(error => next(error))
            }
        })
        */
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if(error.name === 'CastError') {
        return response.status(400).send({ error: 'malformed id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
