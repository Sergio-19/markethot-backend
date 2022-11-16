const Router = require('express')
const router = Router()
const TestController = require('../controllers/test.controller')

router.post('/points', TestController.getAllPoints)


module.exports = router