const express = require('express')
const router = express.Router()

class PutRouter {
    constructor(database) {
        this.database = database;
        this.router = router
    }

    initRoutes() {
        this.router.put('/complete-todo', async (req, res) => {
            const { todo, error } = await this.database.completeTodo(req.body);
            if (error) {
                res.status(404).json({
                    todo,
                    message: error.message
                })
            } else {
                res.status(200).json({
                    todo,
                    message: `Successfully completed this To-do`
                })
            } 
        })
    }
}

module.exports = PutRouter