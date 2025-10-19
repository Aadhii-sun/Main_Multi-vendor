# E-commerce Backend API

A robust Node.js backend API for an e-commerce platform with user authentication, product management, and payment processing.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **User Management**: Registration, login, password reset
- **Product Management**: CRUD operations for products with seller authorization
- **Order Management**: Order creation and management
- **Payment Processing**: Stripe integration for payments
- **Security**: Rate limiting, input validation, helmet security headers
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- Stripe
- bcryptjs
- express-validator
- helmet
- express-rate-limit

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the backend directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   CLIENT_URL=http://localhost:3000
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (seller only)
- `PUT /api/products/:id` - Update product (seller/admin)
- `DELETE /api/products/:id` - Delete product (seller/admin)

### Orders
- `GET /api/orders` - Get user orders (protected)
- `POST /api/orders` - Create new order (protected)
- `GET /api/orders/:id` - Get order by ID (protected)

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent (protected)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NODE_ENV | Environment (development/production) | Yes |
| PORT | Server port | No (default: 5000) |
| MONGO_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret key for JWT tokens | Yes |
| STRIPE_SECRET_KEY | Stripe secret key | Yes |
| CLIENT_URL | Frontend URL for CORS | No |

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation using express-validator
- **Password Security**: bcrypt hashing with salt
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configurable CORS settings
- **Helmet**: Security headers
- **Request Size Limits**: 10MB limit for request bodies

## Error Handling

The API includes comprehensive error handling with:
- Mongoose validation errors
- JWT token errors
- Duplicate key errors
- Cast errors for invalid ObjectIds
- Custom error messages with appropriate HTTP status codes

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

To run in production mode:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC

