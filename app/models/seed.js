// seed.js is going to be the file we run, whenever we want to seed our database, we'll create a bunch of reptiles at once.

// we want to be careful with this, because when we run it, it'll delete all of the reptiles in the db. 

// we can modify this later, to only delete reptiles that don't have an owner already, but we'll keep it simple for now.

const mongoose = require('mongoose')
const Reptile = require('./reptile')
const db = require('../../config/db')

const startReptiles = [
    { name: 'Spikey', type: 'bearded-dragon', color: 'yellow', beginnerFriendly: true },
    { name: 'Lizzy', type: 'iguana', color: 'green', beginnerFriendly: true },
    { name: 'Bob', type: 'snake', color: 'multi-brown', beginnerFriendly: true },
    { name: 'Scotty', type: 'tortoise', color: 'brown', beginnerFriendly: true }
    { name: 'Leo', type: 'getco', color: 'multi-leopard', beginnerFriendly: true}
]

// first we need to connect to the database
mongoose.connect(db, {
    useNewUrlParser: true
})
    .then(() => {
        // first we remove all of the reptiles
        // here we can add something to make sure we only delete reptiles without an owner
        Reptile.deleteMany({ owner: null })
            .then(deletedReptiles => {
                console.log('deletedReptiles', deletedReptiles)
                // the next step is to use our startReptiles array to create our seeded reptiles
                Reptile.create(startReptiles)
                    .then(newReptiles => {
                        console.log('the new reptiles', newReptiles)
                        mongoose.connection.close()
                    })
                    .catch(error => {
                        console.log(error)
                        mongoose.connection.close()
                    })
            })
            .catch(error => {
                console.log(error)
                mongoose.connection.close()
            })
    })
    .catch(error => {
        console.log(error)
        mongoose.connection.close()
    })