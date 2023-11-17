const express = require('express')
const router = express.Router()

class GetRouter {
    constructor(database) {
        this.database = database;
        this.router = router
    }

    initRoutes() {
        this.router.get('/get-account', async (req, res) => {
            const { account, error } = await this.database.getAccount(req.query);
            if (error) {
                res.status(404).json({
                    account,
                    message: error.cause
                })
            } else {
                res.status(200).json({
                    account,
                    message: `Successfully retrieved account`
                })
            }
        })

        this.router.get('/get-todos', async (req, res) => {
            const { todos, error } = await this.database.getTodos(req.query);
            if (error) {
                res.status(404).json({
                    todos,
                    message: error.message
                })
            } else {
                res.status(200).json({
                    todos,
                    message: `Successfully retrieved todo list for user ${req.query.email}`
                })
            }
        })
    }
}

module.exports = GetRouter

