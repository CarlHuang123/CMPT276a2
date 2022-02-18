const express = require('express')
const res = require('express/lib/response')
const path = require('path')
const { Sequelize, DataTypes } = require('sequelize')

const PORT = process.env.PORT || 5000

const rectangles = {}

const sequelize = new Sequelize(
  'postgres://gmrkvwzdvblndw:0a027bb4a878f571a2e6bce2f43a36a30d012bde8f4c2f27618ebda26c86d8e6@ec2-3-89-0-52.compute-1.amazonaws.com:5432/d70celkoubu57f',
  {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      }
    }
  }
)

const Rectangle = sequelize.define('Rectangle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  height: {
    type: DataTypes.INTEGER
  },
  width:{
    type: DataTypes.INTEGER
  },
  color:{
    type: DataTypes.STRING
  }
})

Rectangle.sync()
const app = express()

app.use(express.json())
app.use(express.urlencoded())
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/favicon.ico', async(req,res)=>{
  return res.sendStatus(404)
})
// app.get('/clear',(req,res)=>{
//   Rectangle.sync({force: true})
//   res.send()
// })
app.get('/database', async (req, res) => {
  const rectangles = await Rectangle.findAll()
  return res.render('pages/index', {rectangles})
})
app.get('/:id', async (req, res) => {
  const id = req.params.id
  const rectangle = await Rectangle.findByPk(id)
  return res.render('pages/detail', {rectangle})
})
app.get('/:id/update', async (req, res) => {
  const id = req.params.id
  const rectangle = await Rectangle.findByPk(id)
  return res.render('pages/update', {rectangle})
})
app.get('/api/rectangles', async (req, res) => {
  const rectangles = await Rectangle.findAll()
  return res.json({ results: rectangles })
})
app.post('/api/rectangles', async (req, res) => {
  const rectangle = req.body
  if (!rectangle.name) {
    return res.status(400).send('missing name')
  }
  if (!rectangle.color) {
    return res.status(400).send('missing color')
  }
  if (!rectangle.height) {
    return res.status(400).send('missing height')
  }
  if (!rectangle.width) {
    return res.status(400).send('missing width')
  }

  try {
    const saved = await Rectangle.create(rectangle)
    return res.json({ success: true, rectangle: saved })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})
app.put('/api/rectangles/:id', async (req,res)=>{
  const rectangle = req.body
  if (!rectangle.name) {
    return res.status(400).send('missing name')
  }
  if (!rectangle.color) {
    return res.status(400).send('missing color')
  }
  if (!rectangle.height) {
    return res.status(400).send('missing height')
  }
  if (!rectangle.width) {
    return res.status(400).send('missing width')
  }
  const [saved] = await Rectangle.update(rectangle, {
    where: {
      id:req.params.id
    }
  });
  if(saved){
    return res.json({ success: true})
  }
  else{
    return res.json({ success: false})
  }
})
app.delete('/api/rectangles/:id', async (req, res) => {
  const id = req.params.id
  const rectangle = await Rectangle.findByPk(id)

  if (rectangle) {
    await rectangle.destroy()
    return res.json({ success: true })
  }

  return res.status(404).json({ success: false })
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`))

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection()
