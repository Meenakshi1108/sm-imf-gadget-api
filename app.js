// app.js

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const gadgetsRouter = require('./routes/gadgets');
const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

app.use(cors());
app.use(express.json());

// Swagger UI 
app.use('/sm', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Public routes
app.use('/auth', authRouter);

// Protected routes
app.use('/gadgets', authMiddleware, gadgetsRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
