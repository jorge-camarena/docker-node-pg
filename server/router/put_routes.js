const express = require('express')
const router = express.Router()

class PutRouter {
    constructor(database) {
        this.database = database;
        this.router = router
    }

    initRoutes() {
        this.router.put('/complete-todo', async (req, res) => {
            const completed = await this.database.completeTodo(req.body);
            res.json({
                completed,
                message: `Successfully completed this To-do`
            })
        })
    }
}

module.exports = PutRouter