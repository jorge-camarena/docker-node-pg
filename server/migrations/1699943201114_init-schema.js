
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('accounts', {
        id: {
            type: 'varchar(255)',
            unique: true,
            primaryKey: true,
            notNull: true
        },
        name: { 
            type: 'varchar(100)', 
            notNull: true 
        },
        email: {
            type: 'varchar(100)',
            notNull: true
        },
        password: {
            type: 'varchar(1000)',
            notNull: true
        },
        role: {
            type: 'varchar(100)',
            notNull: true,
            default: 'user'
        },
        created_at: {
          type: 'timestamp',
          notNull: true,
          default: pgm.func('current_timestamp'),
        },
      })
      pgm.createTable('todos', {
        id: {
            type: 'varchar(255)',
            unique: true,
            primaryKey: true,
            notNull: true
        },
        account_id: {
          type: 'varchar(255)',
          notNull: true,
          references: '"accounts"',
        },
        email: {
            type: "varchar(100)",
            notNull: true
        },
        body: {
            type: 'text', 
            notNull: true
        },
        completed: {
            type: "boolean",
            notNull: true,
            default: false
        },
        createdAt: {
          type: 'timestamp',
          notNull: true,
          default: pgm.func('current_timestamp'),
        },
      })
      pgm.createIndex('accounts', 'email')
      pgm.createIndex('todos', 'account_id')
};

exports.down = pgm => {
    pgm.dropTable( "accounts", {
        ifExists: true,
        cascade: true
    })
    pgm.dropTable( "todos", {
        ifExists: true,
        cascade: true
    } )
};