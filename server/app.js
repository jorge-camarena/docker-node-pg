const express = require("express");
const app = express();
const { Client } = require('pg')
const MyDatabase  = require('./db/database.js')
const GetRouter = require('./router/get_routes.js')
const PostRouter = require("./router/post_routes.js")
const PutRouter = require("./router/put_routes.js")
const DeleteRouter = require("./router/delete_routes.js")
require('dotenv').config();


//Setting up Database client connection and importing my own DB objects to handle REQ API
const connectionString = process.env.DATABASE_URL
const client = new Client({
    connectionString
  })
const myDatabase = new MyDatabase(client)
myDatabase.connect()

//Initializing all routes from Router objects
const getRouter = new GetRouter(myDatabase)
const postRouter = new PostRouter(myDatabase)
const putRouter = new PutRouter(myDatabase)
const deleteRouter = new DeleteRouter(myDatabase)
getRouter.initRoutes()
postRouter.initRoutes()
putRouter.initRoutes()
deleteRouter.initRoutes()

//Initializing all middleware
app.use(express.json())
app.use("/api", getRouter.router)
app.use("/api", postRouter.router)
app.use("/api", putRouter.router)
app.use("/api", deleteRouter.Router())

//Setting up networking port
const PORT = process.env.port || 8080
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})