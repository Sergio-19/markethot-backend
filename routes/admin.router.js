
const Router = require('express')
const router = Router()
const adminController = require('../controllers/admin.controller')

router.post('/allgoods', adminController.getAllGoods)
router.post('/onegood', adminController.getOneGood)
router.get('/randomgoods', adminController.getRandomGoods)
router.post('/getcartinfo', adminController.getCartInfo)
router.post('/searchpoints', adminController.searchPoints)
router.post('/postorder', adminController.postOrder)
router.post('/login', adminController.login)
router.post('/getuser', adminController.getUser)



module.exports = router