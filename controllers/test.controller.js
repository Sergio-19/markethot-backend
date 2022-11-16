const databaseQuery = require("../database")





class TestController {

    async getAllPoints(req, res) {


      async  function myQuery(connection) {
            await connection.query(`SELECT * FROM points`, (error, result)=> {
                if(error){
                    console.log(error)
                } else {
                    console.log(result)
                    res.json({"data": result})
                }
            })
        }

        databaseQuery(myQuery)

    }



}


module.exports = new TestController()