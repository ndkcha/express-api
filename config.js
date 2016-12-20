module.exports = {
    'port': process.env.PORT || 8082,
    'accessSecret': 'test',
    'gcmSenderKey': 'AIzaSyAwwRjghxRlA-T5kJALlYpg8s5J5n8GAH0',
    'mysqlPoolConfig': {
        connectionLimit: 100,
        host: 'localhost',
        user: 'vrl',
        password: 'vrl',
        database: 'automint',
        debug: false
    }
}