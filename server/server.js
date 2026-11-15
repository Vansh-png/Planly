const dotenv = require('dotenv');
const express = require('express');
const unless = require('express-unless');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoute = require('./Routes/userRoute');
const boardRoute = require('./Routes/boardRoute');
const listRoute = require('./Routes/listRoute');
const cardRoute = require('./Routes/cardRoute');
const auth = require('./Middlewares/auth');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// AUTH VERIFICATION AND UNLESS

auth.verifyToken.unless = unless;

app.use(
	auth.verifyToken.unless({
		path: [
			{ url: '/user/login', method: ['POST'] },
			{ url: '/user/register', method: ['POST'] },
		],
	})
);

//ENV CHECK

const missingEnv = ['MONGO_URI', 'JWT_SECRET'].filter((key) => !process.env[key]);
if (missingEnv.length) {
	console.error(`Missing required variable(s) in server/.env: ${missingEnv.join(', ')}`);
	process.exit(1);
}
process.env.TOKEN_EXPIRE_TIME = process.env.TOKEN_EXPIRE_TIME || '24h';

//MONGODB ATLAS CONNECTION

mongoose
	.connect(process.env.MONGO_URI, {
		serverSelectionTimeoutMS: 10000,
	})
	.then(() => {
		console.log('Database connection is succesfull!');
	})
	.catch((err) => {
		console.error('Database connection failed!');
		console.error(`Details : ${err}`);
		process.exit(1);
	});

//ROUTES

app.use('/user', userRoute);
app.use('/board', boardRoute);
app.use('/list', listRoute);
app.use('/card', cardRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server is online! Port: ${PORT}`);
});