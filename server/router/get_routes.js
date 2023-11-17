const express = require('express')
const router = express.Router()

class GetRouter {
    constructor(database) {
        this.database = database;
        this.router = router
    }

    initRoutes() {
        this.router.get('/get-account', async (req, res) => {
            console.log(req.query);
            const account = await this.database.getAccount(req.query);

            res.json({
                account,
                message: `Successfully retrieved account`
            })
        })

        this.router.get('/get-todos', async (req, res) => {
            const todos = await this.database.getTodos(req.query);
            console.log(todos)

            res.json({
                todos: todos,
                message: `Successfully retrieved Todos from user ${req.query.email}`
            })

        })
    }
}

module.exports = GetRouter

