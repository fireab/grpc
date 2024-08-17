const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mydatabase.db');

class UserService {
    static create(name, email) {
        return new Promise((resolve, reject) => {  // Return the Promise
            db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function (err) {
                if (err) {
                    let error = new Error(err.message);
                    error.status = 400;
                    reject(error);
                } else {
                    console.log("created!!!");
                    resolve({
                        message: 'success',
                        data: { id: this.lastID.toString(), name, email }
                    });
                }
            });
        });
    }


    static findAll() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM users', [], (err, rows) => {
                if (err) {
                    let error = new Error(err.message);
                    error.status = 400
                    reject(error)
                }
                resolve({
                    message: 'success',
                    data: rows
                });
            });
        })
    }

    static findOne(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) {
                    let error = new Error(err.message);
                    error.status = 400
                    reject(error)
                } else {
                    if (!row) {
                        let error = new Error("not found");
                        error.status = 400
                        return reject(error)
                    }
                    resolve({
                        message: 'success',
                        data:
                        {
                            id: row.id?.toString(),
                            name: row.name,
                            email: row.email
                        }
                    });
                }
            });
        })
    }

}

module.exports = UserService