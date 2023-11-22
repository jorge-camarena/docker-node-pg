const assert = require('assert')
const Database = require('../db/database.js')
const { Client } = require('pg')
require('dotenv').config();
//const test = require('node:test');
const { describe, it } = require('node:test');
const exp = require('constants');

const connectionString = process.env.DATABASE_URL_TEST;
const client = new Client({
    connectionString,
})
const testDatabase = new Database(client)
testDatabase.connect()

describe('Database.createAccount() testing suite:', () => {
    it('Test #1: single call to Database.createAccount()', async () => {
        const body = {
            name: 'Testing createAccount',
            email: "testingcreateaccount@gmail.com",
            password: "test123",
            role: "admin"
        }
        const { account, error } = await testDatabase.createAccount(body)

        const expectedError = null
        assert.equal(body.name, account.name);
        assert.equal(body.email, account.email);
        assert.equal(body.password, account.password);
        assert.equal(body.role, account.role);
        assert.equal(error, expectedError)
        
    })
    it('Test #2: ensures that 2 accounts witht the same email cannot be created', async () => {
        const sameEmail = 'same@gmail.com'
        const { account: expectedAccount } = await testDatabase.createAccount({
            name: 'First call to createAccount()',
            email: sameEmail,
            password: 'firstsecret',
            role: 'admin'
        })
        const { account: actualAccount, error: actualError } = await testDatabase.createAccount({
            name: 'Second call to createAccount()',
            email: sameEmail,
            password: 'secondsecret',
            role: 'admin'
        })
        const expectedError = new Error(`Unable to create account because the following email: ${sameEmail} is already in use`,
        { cause: `Email: ${sameEmail} already exists in database` })

        assert.deepEqual(expectedAccount, actualAccount)
        assert.deepEqual(expectedError, actualError )
    })
})

describe('Database.getAccount() testing suite:', () => {
    it('Test #1: single call to Database.getAccount()', async () => {
        const body = {
            name: 'Testing getAccount',
            email: "testinggetaccount@gmail.com",
            password: "test123",
            role: "admin"
        }
        const { account: expectedAccount, error: expectedError } = await testDatabase.createAccount(body)
        const { account: actualAccount, error: actualError } = await testDatabase.getAccount(body)

        assert.equal(expectedAccount.id, actualAccount.id)
        assert.equal(expectedAccount.name, actualAccount.name)
        assert.equal(expectedAccount.email, actualAccount.email)
        assert.equal(expectedAccount.password, actualAccount.password)
        assert.equal(expectedAccount.role, actualAccount.role)
        assert.equal(expectedError, actualError)
        assert.deepEqual(expectedAccount, actualAccount)
    })

    it('Test #2: Ensure that function returns an error if the account doesnt exist', async () => {
        const testEmail = 'doesntexist@gmail.com'
        const { account, error: actualError } = await testDatabase.getAccount({ email: testEmail }) 
        const expectedError = new Error(`Couldn't retrieve account for ${testEmail}`,
        { cause: 'Account does not exist'})

        assert.equal(account, null)
        assert.deepEqual(expectedError, actualError)
    })
})

describe('Database.deleteAccount() testing suite:', () => {
    it('Test #1: single call to Database.deleteAccount() (creates, deletes, and returns the account)', async () => {
        const body = {
            name: 'Testing deleteAccount',
            email: "testingdeleteaccount@gmail.com",
            password: "test123",
            role: "admin"
        }

        const { account: expectedAccount } = await testDatabase.createAccount(body)
        const { account: actualAccount } = await testDatabase.deleteAccount(body)

        assert.equal(expectedAccount.id, actualAccount.id)
        assert.equal(expectedAccount.name, actualAccount.name)
        assert.equal(expectedAccount.email, actualAccount.email)
        assert.equal(expectedAccount.password, actualAccount.password)
        assert.equal(expectedAccount.role, actualAccount.role)
        assert.deepEqual(expectedAccount, actualAccount)

        const { account: testAccount,  error: actualError } = await testDatabase.getAccount(body);
        const expectedError = new Error(`Couldn't retrieve account for ${body.email}`,
        { cause: 'Account does not exist'})

        assert.equal(testAccount, null)
        assert.deepEqual(expectedError, actualError)
    })
    it("Test #2: Throws an error if client tries to delete an account that doesn't exist", async () => {
        const testEmail = 'deletebutdoesntexist@gmail.com'
        const { account, error: actualError } = await testDatabase.deleteAccount({ email: testEmail})
        const expectedError = new Error(`Unable to delete user with email: ${testEmail}`, 
        { cause: `No such user with email ${testEmail} exists`  })

        assert.equal(account, null)
        assert.deepEqual(actualError, expectedError)
    })
})

describe('Database.createTodo() testing suite', () => {
    it('Test #1: single call to Database.createTodo()', async () => {
        const testEmail = 'testtodo@gmail.com'
        const testText = 'testing Database.createTodo() function'
        const { account } = await testDatabase.createAccount({
            name: 'Testing createTodo',
            email: testEmail,
            password: "testtodo123",
            role: "admin"
        })
        const { todo: actualTodo, error: actualError } = await testDatabase.createTodo({
            email: testEmail,
            text: testText,
            completed: false
        })
        const expectedTodo = {
            id: actualTodo.id,
            account_id: actualTodo.account_id,
            email: testEmail,
            body: testText,
            completed: false,
            createdAt: actualTodo.createdAt
        }

        assert.equal(actualTodo.id, expectedTodo.id)
        assert.equal(actualTodo.account_id, expectedTodo.account_id)
        assert.equal(actualTodo.email, expectedTodo.email)
        assert.equal(actualTodo.body, expectedTodo.body)
        assert.equal(actualTodo.completed, expectedTodo.completed)
        assert.deepEqual(actualTodo, expectedTodo)
        assert.equal(actualError, null)
    })

    it("Test #2: single call to Database.createTodo() when the owner doesn't exist, \
    which should throw an Error", async () => {
        const testEmail ='maketodowithoutaccount@gmail.com' 
        const { todo: actualTodo, error: actualError } = await testDatabase.createTodo({
            email: testEmail,
            text: 'Please return an error so I know this function works',
            completed: false
        })
        const expectedError = new Error(`Unable to create todo for user ${testEmail}`,
        { cause: `No such user with email: ${testEmail} exists`})

        assert.equal(actualTodo, null)
        assert.deepEqual(actualError, expectedError)
    })
})

describe('Database.deleteTodo() testing suite', () => {
    it('Test #1: single call to Database.deleteTodo()', async () => {
        const testEmail = 'testingdeletetodo@gmail.com'
        const testTodo = 'Delete single todo'
        const { account} = await testDatabase.createAccount({
            name: 'Testing deleteAccount',
            email: testEmail,
            password: "test123",
            role: "admin"
        })
        const { todo } = await testDatabase.createTodo({
            email: testEmail,
            text: testTodo,
            completed: false
        })

        const { todo: actualTodo, error: actualError } = await testDatabase.deleteTodo({ id: todo.id })
        const expectedTodo = {
            id: actualTodo.id,
            account_id: actualTodo.account_id,
            email: testEmail,
            body: testTodo,
            completed: false,
            createdAt: actualTodo.createdAt
        }

        assert.equal(actualError, null)
        assert.deepEqual(actualTodo, expectedTodo)

        const data = await testDatabase.client.query({
            text: 'SELECT * FROM todos WHERE id = $1',
            values: [actualTodo.id]
        })

        assert.equal(data.rowCount, 0)
    })

    it('Test #2: single call to Database.deleteTodo() with an invalid id', async () => {
        const fakeId = 'thisisafakeid39if[q2fqfinij4'
        const { todo: actualTodo, error: actualError } = await testDatabase.deleteTodo({ id: fakeId })

        const expectedError = new Error(`Unable to delete todo with id of ${fakeId}`, 
        { cause: `Todo ${fakeId} doesn't exist in the database`})

        assert.equal(actualTodo, null)
        assert.deepEqual(actualError, expectedError)
    
    })

    it('Test #3: Creating multiple todos, ensuring that only one gets deleted', async () => {
        const testEmail = 'testingmultipletodos@gmail.com'
        await testDatabase.createAccount({
            name: 'Testing multiple deleteTodos',
            email: testEmail,
            password: "test123",
            role: "admin"
        })
        var idList = []
        var createdTodoList = []
        for (let i = 0; i < 4; i++) {
            var { todo } = await testDatabase.createTodo({
                email: testEmail,
                text: `This is todo #${i+1}`,
                completed: false
            })
            idList.push(todo.id)
            createdTodoList.push(todo)
        }

        //Retrieving newly created Todos from the test Database
        var data = await testDatabase.client.query({
            text: 'SELECT * FROM todos WHERE email = $1',
            values: [testEmail]
        })
        const todosBeforeDeletion = data.rows
        const countBeforeDeletion = data.rowCount

        //Now deleting a single todo (todo #2).
        const { todo: deletedTodo, error: actualError } = await testDatabase.deleteTodo({ id: idList[1] })

        //Retrieving todos after deletion
        data = await testDatabase.client.query({
            text: 'SELECT * FROM todos WHERE email = $1',
            values: [testEmail]
        })
        const todosAfterDeletion = data.rows
        const countAfterDeletion = data.rowCount


        assert.notDeepEqual(todosBeforeDeletion, todosAfterDeletion)
        assert.notEqual(countBeforeDeletion, countAfterDeletion)
        assert.equal(actualError, null)
        assert.equal(countBeforeDeletion, 4)
        assert.equal(countAfterDeletion, 3)
        assert.deepEqual(deletedTodo, createdTodoList[1])
    })
})

describe('Database.getTodos() testing suite', () => {
    it('Test#1: testing single call to Database.getTodos()', async () => {
        const testEmail = 'testgettodos@gmail.com'
        await testDatabase.createAccount({
            name: 'Single Databse.getTodos() call',
            email: testEmail,
            password: "test123",
            role: "admin"
        })

        //Creating multiple todos
        var expectedTodos = []
        for (i = 0; i < 4; i++) {
            var { todo } = await testDatabase.createTodo({
                email: testEmail,
                text: `Created todo #${i}`,
                completed: false
            })
            expectedTodos.push(todo.body)
        }
        console.log('expected', expectedTodos)

        //Now fetching all Todos from user account
        const { todos: actualTodos, error: actualError } = await testDatabase.getTodos({ email: testEmail })
        console.log('actual', actualTodos)

        assert.equal(actualError, null);
        assert.deepEqual(actualTodos, expectedTodos)
    })
})







describe('Database.clearDatabase() testing suite', () => {
    it('Test #--: This clears the database and runs after all test cases have passed', async () => {
        await testDatabase.clearDatabase()
        const accountsData = await testDatabase.client.query({
            text: 'SELECT * FROM accounts'
        })
        const todosData = await testDatabase.client.query({
            text: 'SELECT * FROM todos'
        })

        assert.equal(accountsData.rowCount, 0)
        assert.equal(todosData.rowCount, 0)

    })
})