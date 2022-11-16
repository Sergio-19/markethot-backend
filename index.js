const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const fs = require('fs')
const path = require('path')
const adminRouter = require('./routes/admin.router')
const testRouter = require('./routes/test.router')
const mysql = require('mysql')


app.use(cors())
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}))
app.use(bodyParser.json({limit: '5mb'}))

const PORT = 5000

app.listen(PORT, ()=> {
    console.log(`Server started on port ${PORT}...`)
})


//admin API

app.use('/admin', adminRouter)

//admin API

//test API
app.use('/test', testRouter)
//test API



  async function allGood() {
    let allGoods = {}
   let catalog = await fs.readdirSync('catalog', (err, data) => {
            return data
    })

    for (const el of catalog) {
        let goodsdata = await fs.readFileSync(path.resolve(__dirname, `catalog/${el}/${el}.json`))
        let goodsArray = JSON.parse(goodsdata)
        allGoods[el] = goodsArray
    }

     let goods = JSON.stringify(allGoods);
  fs.writeFileSync(path.resolve(__dirname, `goods.json`), goods);

  }

  async function createGoods() {
    let data = await fs.readFileSync(path.resolve('goods.json'))
    let goods = JSON.parse(data)
    let categories = Object.keys(goods)
    let allGoods = {}

    categories.forEach((cat)=> {
        allGoods = {...allGoods, ...goods[cat]}
    })

    const connection =  await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'markethot'
    })

    await connection.connect((error)=> {
    if(error){
        return console.log('Ошибка подключения к базе данных!')
    } else {
        return console.log('Подключение успешно')
    }
    })

   Object.keys(allGoods).forEach(async (el, i)=> {
    await connection.query(`INSERT INTO goods (id, name, description, price, article, category, images, kinds) 
VALUES ('${i}', '${allGoods[el].name}', '${allGoods[el].description}', '${allGoods[el].price}', '${allGoods[el].article}', '${allGoods[el].category}', '${JSON.stringify(allGoods[el].images)}', '${JSON.stringify(allGoods[el].kinds)}')`, (error)=> {
if(error) { console.log(error)} else {
    console.log('Товары добавлены в каталог')
}
}) 
   })
   
   await connection.end((error)=> {
    if(error){
        console.log(`Ошибка ${error}`)
    } else {
        console.log('Подключение закрыто')
    }
})
   
  
    
  }

async function getArticles() {
    let data = await fs.readFileSync(path.resolve('goods.json'))
    let goods = JSON.parse(data)
    let categories = Object.keys(goods)
    let articles = []
    categories.forEach((el)=> {
        articles = [...articles, ...Object.keys(goods[el])]

    })
    let allArticles = JSON.stringify(articles);
    fs.writeFileSync(path.resolve(__dirname, `articles.json`), allArticles);
}



async function createPoints() {
    let data = await fs.readFileSync(path.resolve('points.json'))
    let points = JSON.parse(data)


    const connection =  await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'markethot'
    })

    await connection.connect((error)=> {
    if(error){
        return console.log('Ошибка подключения к базе данных!')
    } else {
        return console.log('Подключение успешно')
    }
    })

   Object.keys(points).forEach(async (el, i)=> {
    await connection.query(`INSERT INTO points (id, article, city, address, phone, chart) 
VALUES ('${i}', '${points[el].article}', '${points[el].city}', '${points[el].address}', '${points[el].phone}', '${points[el].chart}')`, (error)=> {
if(error) { console.log(error)} else {
    console.log('Пункты выдачи добавлены в базу данных')
}
}) 
   })
   
   await connection.end((error)=> {
    if(error){
        console.log(`Ошибка ${error}`)
    } else {
        console.log('Подключение закрыто')
    }
})
   
  
    
  }








  



