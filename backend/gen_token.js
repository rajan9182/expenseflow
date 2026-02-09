const jwt = require('jsonwebtoken');
const secret = 'your-super-secret-jwt-key-change-this-in-production';
const userId = '69885041147a329d6b4639a5';

const token = jwt.sign({ userId: userId }, secret, {
    expiresIn: '30d'
});

console.log(token);
