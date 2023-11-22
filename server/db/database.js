const e = require('express');
const { v4: uuidv4 } = require('uuid');

class Database {
    constructor(client) {
        this.client = client
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
                this.client.end()
            }
        }
    };

    async clearDatabase() {
        //This function was created for unit test purposes.
        await this.client.query({
            text: 'TRUNCATE accounts, todos'
        })
    }

    async createAccount(body) {
        //TODO: Salt account password
        const { name, email, password, role} = body
        const accound_id = uuidv4()
        const query = {
            text: 'INSERT INTO accounts(id, name, email, password, role) VALUES($1, $2, $3, $4, $5) RETURNING *',
            values: [accound_id, name, email, password, role]
        }
        //Attempts to fetch a user with the same email from the DB. If it exists, we return the account and throw an error
        const response = await this.client.query({
            text: 'SELECT * FROM accounts WHERE email = $1',
            values: [email]
        })
        var account
        var error
        if (response.rowCount > 0) {
            return {
                account: response.rows[0],
                error: new Error(`Unable to create account because the following email: ${email} is already in use`,
                { cause: `Email: ${email} already exists in database` })
            }
        }

        try {
            const data = await this.client.query(query)
            account = data.rows[0]
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
        const data = await this.client.query(query)
        account = data.rows[0]
        if (data.rowCount == 0) {
            error = new Error(`Couldn't retrieve account for ${email}`,
            { cause: 'Account does not exist'})
            console.log(error)
        }
        return { account, error }
    }

    async deleteAccount(body) {
        const { email } = body
        const query = {
            text: 'DELETE FROM accounts * WHERE email = $1 RETURNING *',
            values: [email]
        }

        var account
        var error

        //
        const response = await this.client.query({
            text: 'SELECT * FROM accounts WHERE email = $1',
            values: [email]
        })
        if (response.rowCount == 0) {
            return {
                account: null,
                error: new Error(`Unable to delete user with email: ${email}`, 
                { cause: `No such user with email ${email} exists`  })
            }
        }
        try {
            this.client.query('BEGIN')
            const data = await this.client.query(query)
            account = data.rows[0]
            await this.client.query({
                text: 'DELETE FROM todos * WHERE account_id = $1',
                values: [account.accound_id]
            })
            this.client.query('END')
        } catch(err) {
            error = new Error(`Unable to delete user with email: ${email}, likely because no such account exists`, 
            { cause: err })
            console.log(err)
            this.client.query('ROLLBACK')
        }
        return { account, error }
    }

    async createTodo(body) {
        const { email, text, completed} = body
        var error
        var todo
        //Attempting to fetch account with the given credentials. This either returns the account_id if found, 
        //or returns an Error saying that the account was not able to be found
        const response = await this.client.query({
            text: 'SELECT * FROM accounts WHERE email = $1',
            values: [email]
        })
        if (response.rowCount == 0) {
            return {
                todo,
                error: new Error(`Unable to create todo for user ${email}`,
                { cause: `No such user with email: ${email} exists`})
            }
        }
        const account = response.rows[0]
        const data = await this.client.query({
            text: 'INSERT INTO todos(id, account_id, email, body, completed) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            values: [uuidv4(), account.id, email, text, completed]
        })

        todo = data.rows[0]

        return { todo, error }
    }

    async deleteTodo(body) {
        const { id } = body 
        var todo;
        var error;

        const data = await this.client.query({
            text: 'DELETE FROM todos * WHERE id = $1 RETURNING *',
            values: [id]
        })
        if (data.rowCount == 0) {
            return {
                todo,
                error: new Error(`Unable to delete todo with id of ${id}`, 
                { cause: `Todo ${id} doesn't exist in the database`})
            }
        }
        todo = data.rows[0]
        return { todo, error}
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