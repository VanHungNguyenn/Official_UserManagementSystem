const express = require('express');
const authController = require('../controllers/auth');
const userController = require('../controllers/userControllers');
const path = require('path');

const router = express.Router();

router.get('/dashboard', authController.isLoggedIn, userController.view);
router.get('/register', userController.register);
router.get('/', authController.isLoggedIn, userController.home);
router.get('/login', userController.login);
router.get('/profile', authController.isLoggedIn, userController.profile);
router.get('/adduser', userController.form);
router.post('/adduser', userController.create);
router.get('/edituser/:id', userController.edit);
router.post('/edituser/:id', userController.update);
router.get('/viewuser/:id', userController.viewall);
router.get('/:id', userController.delete);

module.exports = router;