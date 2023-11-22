const router = require('express').Router()

class DeleteRouter {
    constructor(database) {
        this.router = router
        this.database = database
    }

    Router() {
        return this.router
    }

    initRoutes() {
        this.router.delete('/delete-account', async (req, res) => {
            const { account, error } = await this.database.deleteAccount(req.body)
            if (error) {
                res.status(404).json({
                    message: `HTTP Error Code 404: Unable to delete account for user ${req.body.email}`,
                    error: error.cause
                }) 
            } else {
                res.json({
                    account,
                    message: `Successfully deleted account for ${account.name}`
                })
            }
        })

        this.router.delete('/delete-todo', async (req, res) => {
            const { account, error } = await this.database.deleteTodo(req.body)
            if (error) {
                res.status(404).json({
                    message: `HTTP Error Code 404: Unable to delete todo with id of ${req.body.id}`,
                    error: error.cause
                })
            } else {
                res.json({
                    todo,
                    message: `Successfully deleted todo: ${todo.body}`
                })
            }
        })
    }
}

module.exports = DeleteRouter