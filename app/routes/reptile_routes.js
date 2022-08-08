// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for reptiles
const Reptile = require('../models/reptile')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /reptiles
router.get('/reptiles', (req, res, next) => {
	// we want everyone to see the reptiles, whether they're logged in or not.
	// if we wanted to protect these resources, then we can add that middleware back in. and we would place it between the route and the callback function.(second argument)
	Reptile.find()
		.populate('owner')
		.then((reptiles) => {
			// console.log('the whole request', req)
			// `reptiles` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return reptiles.map((reptile) => reptile.toObject())
		})
		// respond with status 200 and JSON of the reptiles
		.then((reptiles) => res.status(200).json({ reptiles: reptiles }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// SHOW
// GET /reptiles/5a7db6c74d55bc51bdf39793
router.get('/reptiles/:id', (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Reptile.findById(req.params.id)
		.populate('owner')
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "reptile" JSON
		.then((reptile) => res.status(200).json({ reptile: reptile.toObject() }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// CREATE
// POST /reptiles
router.post('/reptiles', requireToken, (req, res, next) => {
	// set owner of new reptile to be current user
	req.body.reptile.owner = req.user.id

	reptile.create(req.body.reptile)
		// respond to succesful `create` with status 201 and JSON of new "reptile"
		.then((reptile) => {
			res.status(201).json({ reptile: reptile.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

// UPDATE
// PATCH /reptiles/5a7db6c74d55bc51bdf39793
router.patch('/reptiles/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.reptile.owner

	Reptile.findById(req.params.id)
		.then(handle404)
		.then((reptile) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, reptile)

			// pass the result of Mongoose's `.update` to the next `.then`
			return reptile.updateOne(req.body.reptile)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DESTROY
// DELETE /reptiles/5a7db6c74d55bc51bdf39793
router.delete('/reptiles/:id', requireToken, (req, res, next) => {
	Reptile.findById(req.params.id)
		.then(handle404)
		.then((reptile) => {
			// throw an error if current user doesn't own `reptile`
			requireOwnership(req, reptile)
			// delete the reptile ONLY IF the above didn't throw
			reptile.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router