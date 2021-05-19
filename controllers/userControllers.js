const mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: '',
    database: process.env.DATABASE
});

exports.view = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; //not connected!
        console.log('Connected as ID ' + connection.threadId);
        //User the connection
        connection.query('SELECT * FROM user WHERE status = "active"', (err, rows) => {
            //When done with the connection, release it
            connection.release();
            //console.log(rows);
            if (!err) {
                let removedUser = req.query.removed;
                res.render('dashboard', { rows, removedUser });
            } else {
                console.log(err);
            }
            console.log('The data from user the table: \n', rows);
        });
    });
}

exports.home = (req, res) => {
    res.render('index', {
        user: req.user
    });
}

exports.register = (req, res) => {
    res.render('register');
}

exports.login = (req, res) => {
    res.render('login');
}

exports.profile = (req, res) => {
    if (req.user) {
        res.render('profile', {
            user: req.user
        });
    } else {
        res.redirect('/login');
    }
}

exports.form = (req, res) => {
    res.render('adduser');
}

//Add new user
exports.create = (req, res) => {
    const { email, password, recoveryemail, name, birthday, comments } = req.body;
    var regday = formatDate(new Date());

    pool.getConnection((err, connection) => {
        if (err) throw err; //not connected!
        console.log('Connected as ID ' + connection.threadId);

        let searchTerm = req.body.search;

        connection.query('INSERT INTO user SET email = ?, password = ?, recoveryemail = ?, name = ?, birthday = ?, regday = ?, comments = ?', [email, password, recoveryemail, name, birthday, regday, comments], (err, rows) => {
            //When done with the connection, release it
            connection.release();
            if (!err) {
                res.render('adduser', { alert: 'User added successfully.' });
            } else {
                console.log(err);
            }
            console.log('The data from user the table: \n', rows);
        });
    });
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

exports.edit = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; //not connected!
        console.log('Connected as ID ' + connection.threadId);
        //User the connection

        connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
            //When done with the connection, release it
            connection.release();
            if (!err) {
                res.render('edituser', { rows });
            } else {
                console.log(err);
            }
            console.log('The data from user the table: \n', rows);
        });
    });
}

//Update user
exports.update = (req, res) => {
    const { email, password, recoveryemail, name, birthday, comments } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err; //not connected!
        console.log('Connected as ID ' + connection.threadId);
        //User the connection

        connection.query('UPDATE user SET email = ?, password = ?, recoveryemail = ?, name = ?, birthday = ?, comments = ? WHERE id = ?', [email, password, recoveryemail, name, birthday, comments, req.params.id], (err, rows) => {
            //When done with the connection, release it
            connection.release();
            if (!err) {

                pool.getConnection((err, connection) => {
                    if (err) throw err; //not connected!
                    console.log('Connected as ID ' + connection.threadId);
                    //User the connection

                    connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
                        //When done with the connection, release it
                        connection.release();
                        if (!err) {
                            res.render('edituser', { rows, alert: `${email} has been updated` });
                        } else {
                            console.log(err);
                        }
                        console.log('The data from user the table: \n', rows);
                    });
                });
            } else {
                console.log(err);
            }
            console.log('The data from user the table: \n', rows);
        });
    });
}

exports.delete = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err; //not connected!
        console.log('Connected as ID ' + connection.threadId);

        connection.query('UPDATE user SET status = ? WHERE id = ?', ['removed', req.params.id], (err, rows) => {
            //When done with the connection, release it
            connection.release();
            if (!err) {
                let removedUser = encodeURIComponent('User successfully removed');
                res.redirect('/dashboard/?removed=' + removedUser);
            } else {
                console.log(err);
            }
            console.log('The data from user the table: \n', rows);
        });
    });
}

exports.viewall = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; //not connected!
        console.log('Connected as ID ' + connection.threadId);
        //User the connection
        connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
            //When done with the connection, release it
            connection.release();
            if (!err) {
                res.render('viewuser', { rows });
            } else {
                console.log(err);
            }
            console.log('The data from user the table: \n', rows);
        });
    });
}