const path = require('path')
const fs = require('fs')
const mysql = require('mysql')
const databaseQuery = require('../database')
const config = require('../config')
const YooKassa = require('yookassa');


class Admin {

    async getAllGoods(req, res) {
        const category = req.body.category

        async function myQuery(connection) {
            await connection.query(`SELECT * FROM goods WHERE category LIKE '${category}'`, (error, goods)=> {
            if(error){console.log(error)} else {
                let allGoods = {}

                Object.keys(goods).forEach((el)=> {
                    let good = {
                        id: goods[el].id,
                        name: goods[el].name,
                        description: goods[el].description,
                        price: goods[el].price,
                        article: goods[el].article,
                        category: goods[el].category,
                        images: JSON.parse(goods[el].images),
                        kinds: JSON.parse(goods[el].kinds)
                    }
                    allGoods[goods[el].article] = good
                })
            
                res.json({"goods": allGoods, "request": category})
            }
        }) 
        }

        async function myQuery2(connection) {
            await connection.query(`SELECT * FROM goods WHERE name LIKE '%${category}%'`, (error, goods)=> {
            if(error){console.log(error)} else {
                let allGoods = {}

                Object.keys(goods).forEach((el)=> {
                    let good = {
                        id: goods[el].id,
                        name: goods[el].name,
                        description: goods[el].description,
                        price: goods[el].price,
                        article: goods[el].article,
                        category: goods[el].category,
                        images: JSON.parse(goods[el].images),
                        kinds: JSON.parse(goods[el].kinds)
                    }
                    allGoods[goods[el].article] = good
                })
            
                res.json({"goods": allGoods, "request": category})
            }
        }) 
        }

        if(req.body.met === 'search'){
          databaseQuery(myQuery2)  
        } else {
            databaseQuery(myQuery)
        }

        

       

      
        
    }

    async getOneGood(req, res) {
        const article = req.body.article

        async function myQuery(connection) {
            await connection.query(`SELECT * FROM goods WHERE article = '${article}'`, (error, result)=> {
                if(error) {
                    console.log('???????????? ?????? ?????????????? ?? ???????? ????????????', error)
                } else {
                    let good = {id: result[0].id,
                                name: result[0].name,
                                description: result[0].description,
                                price: result[0].price,
                                article: result[0].article,
                                category: result[0].category,
                                images: JSON.parse(result[0].images),
                                kinds: JSON.parse(result[0].kinds)    
                                }
    
                    res.json({"good": good})
                }
            
            }) 
        }


        databaseQuery(myQuery)
         
    }

    async getRandomGoods(req, res) {
        let arr = []
        for(let i = 0; i < 12; i++) {
            arr.push(Math.floor(Math.random()*1500))
        }
        let data = await fs.readFileSync(path.resolve(__dirname, '../articles.json'))
        let articles = JSON.parse(data)
        let articlesArray = []
        arr.forEach((el)=>{
            articlesArray.push(articles[el])
        })

       async function myQuery(connection) {
        await connection.query(`SELECT * FROM goods WHERE article IN (`+ articlesArray.join(',') + `)`, (error, goods)=> {
                if(error) {
                    console.log('?????????????????? ???????????? ?????? ??????????????', error)
                } else {
                    let allGoods = {}

                    Object.keys(goods).forEach((el)=> {
                        let good = {
                            id: goods[el].id,
                            name: goods[el].name,
                            description: goods[el].description,
                            price: goods[el].price,
                            article: goods[el].article,
                            category: goods[el].category,
                            images: JSON.parse(goods[el].images),
                            kinds: JSON.parse(goods[el].kinds)
                        }
                        allGoods[goods[el].article] = good
                    })
                
                    res.json({"goods": allGoods})
                }
        })  
       }

       databaseQuery(myQuery)
            
    }

    //?????????????????? ???? ???????? ?????????????? ?????????????????????? ?? ??????????????

    async getCartInfo(req, res) {
       const cart = req.body.cart
       const newCart = JSON.parse(cart)


        async function myQuery(connection) {
            await connection.query(`SELECT * FROM goods WHERE article IN (`+ newCart.join(',') + `)`, (error, goods)=> {
                if(error) {
                    console.log('?????????????????? ???????????? ?????? ??????????????', error)
                } else {
                    let allGoods = {}
    
                    Object.keys(goods).forEach((el)=> {
                        let good = {
                            id: goods[el].id,
                            name: goods[el].name,
                            description: goods[el].description,
                            price: goods[el].price,
                            article: goods[el].article,
                            category: goods[el].category,
                            images: JSON.parse(goods[el].images),
                            kinds: JSON.parse(goods[el].kinds)
                        }
                        allGoods[goods[el].article] = good
                    })
                
                    res.json({"goods": allGoods})
                }
        })
        }

        databaseQuery(myQuery)

    }

    // ?????????? ?????????????? ???????????? ?????????????? ?? ????????
    async searchPoints(req, res) {
        const search = req.body.search
       
     async function myQuery(connection) {
        await connection.query(`SELECT * FROM points WHERE city LIKE '%${search}%' OR address LIKE '%${search}%'`, (error, result)=> {
            if(error) {
                console.log('???????????? ?????? ?????????????? ?? ???????? ????????????', error)
                res.json({"message": '?????????? ???? ?????? ??????????????????????', "success": 'false'})
            } else {
                res.json({"message": "??????????????", "success": result.length === 0 ? false : true, "points": result})
            }
        
        })
     }

     databaseQuery(myQuery)
         

       
    }

    //?????????????????? ???????????? ?????? ???????????????? ???????????? ?? ???????????????????? ?? ????
    async postOrder(req, res) {
        const order = JSON.parse(req.body.order)
        const goods =  JSON.stringify(order.goods)

        const yooKassa = new YooKassa({
            shopId: config.shopid,
            secretKey: config.apikey
        });

        const payment = await yooKassa.createPayment({
            amount: {
              value: `${order.sum}.00`,
              currency: "RUB"
            },
            payment_method_data: {
                type: "bank_card"
            },
            confirmation: {
              type: "redirect",
              return_url: "https://hopastore.ru"
            },
            description: `?????????? ???${order.order}, ${order.email || ''}`
        });


      if(req.body.order) {

        const connection =  await mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database
        })
    
        await connection.connect((error)=> {
            if(error){
                return console.log('???????????? ?????????????????????? ?? ???????? ????????????!')
            } else {
                return console.log('?????????????????????? ??????????????')
            }
            })

        await connection.query(`INSERT INTO orders (number, goods) VALUES ('${order.order}', '${goods}')`, (error)=> {
            if(error){
                console.log(error, '???????????? ?????? ???????????????????? ???????????? ?? ?????????????? orders')
            } else {
                console.log(`?????????? ???${order.order} ???????????????? ?? ???????? ????????????`)
               
            }

        })   
        
        let user = new Promise((resolve, reject)=> {
            connection.query(`SELECT * FROM users WHERE email = '${order.email}'`, (error, result)=> {
                if(error) {
                    reject(error)
                } else {
                    resolve(result)       
                }
            })
        })

        let user2 = new Promise((resolve, reject)=> {
            connection.query(`INSERT INTO users (name, phone, email, address, orders) 
            VALUES ('${order.name}', '${order.phone}', '${order.email}', '${order.address}', '${order.order}')`, (error, result)=> {
                if(error) {
                    reject(error)
                } else {
                    resolve(result)       
                }
            })
        })

        let user3 = new Promise((resolve, reject)=> {
            connection.query(`UPDATE users SET name = '${order.name}', phone = '${order.phone}', email = '${order.email}', 
            address = '${order.address}', orders = '${order.order}'  WHERE email LIKE '${order.email}'`, (error, result)=> {
                if(error) {
                    reject(error)
                } else {
                    resolve(result)       
                }
            })
        })

        user.then((value)=>{
            if(value.length === 0){
                user2.then((dat)=>{
                    console.log(dat)
                })
            } else {
                user3.then((dat)=>{
                    console.log(dat)
                })
            }
        })

       
        res.json({'message': `?????????? ??? ${order.order} ???????????????? ?? ???????? ????????????`, 
                  "payment": payment,
                  "order": order  
                })

        await connection.end((error)=> {
            if(error){
                console.log(`???????????? ${error}`)
            } else {
                console.log('?????????????????????? ??????????????')
            }
        })


      } else {
        res.json({'message': '???????????? ??????????'})
        console.log('???????????? ????????????')
      }
    }

    //???????? ?? ??????????????
    async login(req, res) {
        const {email} = req.body
        
        async  function myQuery(connection) {
            await connection.query(`SELECT * FROM users WHERE email = '${email}'`, (error, result)=> {
                if(error){
                    console.log(error)
                } else {
                    if(result.length === 0){
                     res.json({"message": '???????????? ???? ?? ?????? ??????????????, ?????????? ?????????????? ???????????? ???????? ???????????????????????? ???????????? ?? ???????????????????? ?? ?????????????? ?????????? ?????????????????? ?? ?????????? ??????????????.', "success": false})   
                    } else {
                        res.json({"user": result[0], "success": true, "token": 'kskahsjqhuwyquy&wuywuyu?gas###qyt'})
                    }
                    
                }
            })
        }

        databaseQuery(myQuery)


    }

    async getUser(req, res) {
        const {email} = req.body
        
        async  function myQuery(connection) {
            await connection.query(`SELECT * FROM users WHERE email = '${email}'`, (error, result)=> {
                if(error){
                    console.log(error)
                } else {
                    if(result.length === 0){
                     res.json({"message": '???????????????????????? ?? ?????????? email ???? ????????????', "success": false})   
                    } else {
                        res.json({"user": result[0], "success": true})
                    }
                    
                }
            })
        }

        databaseQuery(myQuery)


    }

}

module.exports = new Admin()