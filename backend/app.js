const express = require("express");
const logger = require("morgan");
const crypto = require('crypto');

const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = 5000;

const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require("cors");
const jwt = require('jsonwebtoken');

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Clé secrète pour signer les tokens JWT

// Générer une clé JWT_SECRET aléatoire
const JWT_SECRET = crypto.randomBytes(12).toString('hex');
// const JWT_SECRET = "my_secret_key_was_generated_by_crypto_but_not_fn";

let users = [
    {
        username: 'sam',
        password: '$2a$10$9/3icwuUXQo8J9Hbc4dyLu24JjQ./PDW.60WhpUMyrFW5aGqa51mS'
    }
];
console.log('users : ', users);
// Route pour la création d'un compte
app.post('/signup', async (req, res) => {
    delete req.body.confirmPassword;
    const { username, password } = req.body;
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'L\'utilisateur existe déjà.' });
    }
    // Hachage du mot de passe avant de le stocker
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);
    // console.log('hash : ', hashedPassword);
    users.push({ username, password: hashedPassword });
    res.status(201).json({ message: 'Compte créé avec succès.' });
});

// Route pour la connexion
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // console.log(req.body);
    // Recherche de l'utilisateur dans la base de données
    const user = users.find(user => user.username === username);
    // Vérification de username
    if (!user) {
        return res.status(400).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
    }
    // Vérification du mot de passe 
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(400).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
    }
    // Générer un token JWT
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '4h' });
    if (user && passwordMatch) {
        return res.status(200).json({ user: user.username, token: token });
    }
});

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // console.log('auth is here : ', authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    // console.log('token recived :', token);
    if (token == null) return res.status(401).json({ message: 'Token JWT manquant.' });
    // console.log('req user', req);
    jwt.verify(token, JWT_SECRET, function (err, decoded) {
        if (err) {
            console.log('err token verif :', err);
            return;
        }
        // console.log('decode :', decoded);
        next();
    });
};

// Route protégée pour la page d'accueil
app.get('/home', authenticateToken, (req, res) => {
    res.status(200).json({ auth: true });
});

app.listen(PORT, () => {
    console.log(`Serveur ecoute sur le port ${PORT}`);
});

// module.exports = app;