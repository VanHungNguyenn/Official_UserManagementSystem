const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');


var connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: '',
    database: process.env.DATABASE
});


exports.register = (req, res) => {
    console.log(req.body);

    const { name, email, password, passwordConfirm } = req.body;

    connection.query('SELECT email FROM users WHERE email = ?', [email], async(err, results) => {
        if (err) {
            console.log(err);
        }

        if (results.length > 0) {
            return res.render('register', {
                message: 'That email is already in use',
                color: 'danger'
            });
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: 'Password do not match',
                color: 'danger'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        connection.query('INSERT INTO users SET ?', { name: name, email: email, password: hashedPassword }, (err, results) => {
            if (err) {
                console.log(err);
            } else {
                console.log(results);
                return res.render('register', {
                    message: 'User registered',
                    color: 'success'
                });
            }
        });
    });
}

exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).render('login', {
                message: 'Please provide an email and password',
                color: 'danger'
            });
        }

        connection.query('SELECT * FROM users WHERE email = ?', [email], async(err, results) => {
            console.log("Results: ", results);
            if (err) {
                res.status(401).render('login', {
                    message: 'Email not found',
                    color: 'danger'
                });
            } else if (results.length == 0) {
                res.status(401).render('login', {
                    message: 'Email not found',
                    color: 'danger'
                });
            } else {
                if (!results || !(await bcrypt.compare(password, results[0].password))) {
                    res.status(401).render('login', {
                        message: 'Email or Password is incorrect',
                        color: 'danger'
                    });
                } else {
                    const id = results[0].id;
                    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                        expiresIn: process.env.JWT_EXPIRES_IN
                    });


                    const cookieOptions = {
                        expires: new Date(
                            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                        ),
                        httpOnly: true
                    }

                    res.cookie('jwt', token, cookieOptions);
                    res.status(200).redirect('/dashboard');
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
}

exports.isLoggedIn = async(req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1. verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt,
                process.env.JWT_SECRET);

            // 2. check if the user still exists
            connection.query('SELECT * FROM users WHERE id = ?', [decoded.id], (err, results) => {
                if (!results) {
                    return next();
                }

                req.user = results[0];
                return next();
            });

        } catch (error) {
            console.log(error);
            return next();
        }
    } else {
        next();
    }
};

exports.logout = async(req, res) => {
    res.clearCookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });

    res.status(200).redirect('/');
};