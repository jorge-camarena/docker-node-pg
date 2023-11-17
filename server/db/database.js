const { v4: uuidv4 } = require('uuid');

class Database {
    constructor(client) {
        this.client = client
        this.connected = false
    };

    async connect() {
        await new Promise(resolve => setTimeout(resolve, 5000))
        var attemps = 10
        while (attemps) {
            try {
                await this.client.connect();
                console.log("successfully connected to dev DB")
                break;
            } catch (err) {
                console.log(err)
                attemps -= 1
                console.log(`Couldn't connection to DB; Attemps remaining: ${attemps}`)
            }
        }
    };

    async createAccount(body) {
        const { name, email, password, role} = body
        const accound_id = uuidv4()
        const query = {
            text: 'INSERT INTO accounts(id, name, email, password, role) VALUES($1, $2, $3, $4, $5)',
            values: [accound_id, name, email, password, role]
        }
        var account
        var error = null
        try {
            await this.client.query(query)
            account = {
                accound_id,
                name,
                email,
                password,
                role
            }
        } catch(err) {
            error = new Error(`Could not create account for ${name}`,
            { cause: err })
            console.log(err)
        }
        return { account, error }
    }

    async getAccount(params) {
        const { email } = params
        const query = {
            text: 'SELECT * FROM accounts WHERE email = $1',
            values: [email]
        }
        var error
        var account
        try {
            const res = await this.client.query(query)
            account = res.rows[0]
        } catch(err) {
            error = new Error(`Couldn't retrieve account for ${email}`,
            { cause: err })
            console.log(error)
            account = {
                message: `No such user found with email: ${email}`
            }
        }

        return { account, error }
    }

    async createTodo(body) {
        const { email, text, completed} = body
        
        var error
        var todo
        var account_id
        const fetchIDQuery = {
            text: 'SELECT * FROM accounts WHERE email = $1',
            values: [email]
        }

        try {
            const data = await this.client.query(fetchIDQuery);
            account_id = data.rows[0].id
        } catch(err) {
            error = new Error(`Unable to retrieve account_id for user ${email}`, 
            {cause: err})
            console.log(err)
            todo = {
                message: 'Could not create Todo'
            }
            return { todo, error}
        }

        const todoID = uuidv4()
        const query = {
            text: 'INSERT INTO todos(id, account_id, email, body, completed) VALUES ($1, $2, $3, $4, $5)',
            values: [todoID, account_id, email, text, completed]
        }
        try {
            await this.client.query(query)
            todo = {
                id: todoID,
                account_id,
                email,
                body: text,
                completed
            }

        } catch(err) {
            error = new Error(`Couldn't create todo for user ${email}`, 
            {cause: err})
            console.log(err)
        }

        return { todo, error }
    }

    async getTodos(body) {
        const { email } = body
        const fetchIDQuery = {
            text: 'SELECT * FROM accounts WHERE email = $1',
            values: [email]
        }

        var error
        var account_id
        try {
            const data = await this.client.query(fetchIDQuery);
            console.log(data)
            account_id = data.rows[0].id 

        } catch(err) {
            error = new Error(`Couldn't retrieve todos for account ${email}`,
            { cause: err })
            console.log(err)
            return { todos: [] , error}
        }
        const query = {
            text: 'SELECT (body) FROM todos WHERE account_id = $1',
            values: [account_id]
        }
        var todos = []
        try {
            const res = await this.client.query(query);
            for (var i = 0; i < res.rows.length; i++) {
                todos.push(res.rows[i].body)
            }
        } catch(err) {
            error = new Error(`Couldn't retrieve todos for account ${email}`, 
            { cause: err })
            console.log(err)
        }

        return { todos,  error }
    }

    async completeTodo(body) {
        const { completed, id } = body
        const query = {
            text: 'UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *',
            values: [completed, id]
        }
        var todo
        var error
        try {
            const data = await this.client.query(query)
            console.log(data)
            todo = data.rows[0]
        }catch(err) {
            error = new Error(`Could not complete todo for todo with id: ${id}`,
            { cause: err })
            console.log(err)
        }
        return { todo, error}
    }
}

module.exports = Database