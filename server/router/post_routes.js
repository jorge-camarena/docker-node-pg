//Initializing all POST routes for ToDo API

const express = require("express");
const router = express.Router();

class PostRouter {
    constructor(database) {
        this.router = router
        this.database = database
    }

    initRoutes() {
        // example JSON POST request body:
        // {
        //     "name": "Jorge",
        //     "email": "jorge@email.com",
        //     "password": "secret123",
        //     "role": "admin"
        // }
        this.router.post('/create-account', async (req, res) => {
            const { account, error } = await this.database.createAccount(req.body);
            if (error) {
                res.status(404).json({
                    message: 'HTTP Error code 404, POST request does not meet criteria for user acount',
                    error: error.cause
                })
            } else {
                res.status(200).json({
                    account: account,
                    message: `Successfully created account for user ${req.body.name}`
                })
            }
        })

        this.router.post('/create-todo', async (req, res) => {
            const {todo, error} = await this.database.createTodo(req.body);
            if (error) {
                res.status(404).json({
                    message: `HTTP Error code 404, could not create todo for user ${req.body.email}`,
                    error: error.cause
                })
            } else {
                res.status(200).json({
                    todo,
                    message: `Successfully created todo for user ${req.body.email}`
                })
            }
        })
    }   
}

module.exports = PostRouter
