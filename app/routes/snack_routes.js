const express = require('express')
const passport = require('passport')

// pull in Mongoose model for reptiles
const Reptile = require('../models/reptile')

const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// ROUTES GO HERE
// we only need three, and we want to set them up using the same conventions as our other routes, which means we might need to refer to those other files to make sure we're using our middleware correctly

// POST -> create a snack
// POST /snacks/<reptile_id>
router.post('/snacks/:reptileId', removeBlanks, (req, res, next) => {
    // get our snack from req.body
    const snack = req.body.snack
    // get our reptile's id from req.params.reptileId
    const reptileId = req.params.reptileId
    // find the reptile
    Reptile.findById(reptileId)
        .then(handle404)
        .then(reptile => {
            console.log('this is the reptile', reptile)
            console.log('this is the snack', snack)

            // push the snack into the reptile's snacks array
            reptile.snacks.push(snack)

            // save the reptile
            return reptile.save()
            
        })
        // send the newly updated reptile as json
        .then(reptile => res.status(201).json({ reptile: reptile }))
        .catch(next)
})

// UPDATE a snack
// PATCH /snacks/<reptile_id>/<snack_id>
router.patch('/snacks/:reptileId/:snackId', requireToken, removeBlanks, (req, res, next) => {
    // get the snack and the reptile ids saved to variables
    const reptileId = req.params.reptileId
    const snackId = req.params.snackId

    // find our reptile
    Reptile.findById(reptileId)
        .then(handle404)
        .then(reptile => {
            // single out the snack (.id is a subdoc method to find something in an array of subdocs)
            const theSnack = reptile.snacks.id(snackId)
            // make sure the user sending the request is the owner
            requireOwnership(req, reptile)
            // update the snack with a subdocument method
            theSnack.set(req.body.snack)
            // return the saved reptile
            return reptile.save()
        })
        .then(() => res.sendStatus(204))
        .catch(next)
})

// DELETE a snack
// DELETE /snacks/<reptile_id>/<snack_id>
router.delete('/snacks/:reptileId/:snackId', requireToken, (req, res, next) => {
    // get the snack and the reptile ids saved to variables
    const reptileId = req.params.reptileId
    const snackId = req.params.snackId
    // then we find the reptile
    Reptile.findById(reptileId)
        // handle a 404
        .then(handle404)
        // do stuff with the snack(in this case, delete it)
        .then(reptile => {
            // we can get the subdoc the same way as update
            const theSnack = reptile.snacks.id(snackId)
            // require that the user deleting this snack is the reptile's owner
            requireOwnership(req, reptile)
            // call remove on the subdoc
            theSnack.remove()

            // return the saved reptile
            return reptile.save()
        })
        // send 204 no content status
        .then(() => res.sendStatus(204))
        // handle errors
        .catch(next)
})

// export the router
module.exports = router