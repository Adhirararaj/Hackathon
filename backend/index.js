const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes')
const queryRoutes = require('./routes/queryRoutes')
const adminRoutes = require('./routes/adminRoutes')

const dotenv = require('dotenv');
dotenv.config();


const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT


app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Vaantra Backend Server is running', 
    status: 'OK',
  });
});

app.use('/api/user', userRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/admin', adminRoutes);


(async () => {

  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

})();
