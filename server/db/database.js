const { v4: uuidv4 } = require('uuid');

class Database {
    constructor(client) {
        this.client = client
        this.connected = false
    };

    async connect() {
        var attemps = 10
        while (attemps) {
            try {
                await this.client.connect();
                console.log("successfully connected to dev DB")
                break;
            } catch (err) {
                console.log(err)
                attemps -= 1
                console.log(`Attemps remaining: ${attemps}`)
                //wait 5 seconds
                await new Promise( res => setTimeout(res, 5000))
            }
        }
    };

    async createAccount(body) {
        if (!this.connected) {
            this.client.connect()
            this.connected = true
        }
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
        if (!this.connected) {
            this.client.connect()
            this.connected = true
        }
        const { email } = params
        const query = {
            text: 'SELECT * FROM accounts WHERE email = $1',
            values: [email]
        }
        const res = await this.client.query(query)
        return res.rows[0]
    }

    async createTodo(body) {
        if (!this.connected) {
            this.client.connect()
            this.connected = true
        }
        const { email, text, completed} = body

        const fetchIDQuery = {
            text: 'SELECT * FROM accounts WHERE email = $1',
            values: [email]
        }

        const data = await this.client.query(fetchIDQuery);
        console.log(data.rows)
        const account_id = data.rows[0].id

        const query = {
            text: 'INSERT INTO todos(id, account_id, owner, body, completed) VALUES ($1, $2, $3, $4, $5)',
            values: [uuidv4(), account_id, email, text, completed]
        }
        const res = await this.client.query(query)
        return res.rows[0]
    }

    async getTodos(body) {
        if (!this.connected) {
            this.client.connect()
            this.connected = true
        }

        const { email } = body

        const fetchIDQuery = {
            text: 'SELECT * FROM accounts WHERE email = $1',
            values: [email]
        }
        const data = await this.client.query(fetchIDQuery);
        const account_id = data.rows[0].id
        
        const query = {
            text: 'SELECT (body) FROM todos WHERE account_id = $1',
            values: [account_id]
        }

        const res = await this.client.query(query);
        console.log(res.rows)
        const todos = []
        for (var i = 0; i < res.rows.length; i++) {
            todos.push(res.rows[i].body)

        }
        return todos






    }

    async completeTodo(body) {
        if (!this.connected) {
            this.client.connect()
            this.connected = true
        }
        const { email } = body

        const fetchIDQuery = {
            text: 'SELECT * FROM accounts WHERE email = $1',
            values: [email]
        }
        const data = await this.client.query(fetchIDQuery);
        const { completed, id } = body
        const query = {
            text: 'UPDATE todos SET completed = $1 WHERE id = $2',
            values: [completed, id]
        }

        const res = await this.client.query(query)
        return res.rows[0]
    }
}

module.exports = Database