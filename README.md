# Node App V1

A Node.js booking application built with Express.js, Sequelize ORM, and MySQL database. This package provides a complete REST API for managing bookings with user authentication.

## Features

- 🔐 User authentication with JWT tokens
- 📅 Booking management system
- 📧 Email notifications
- 🗄️ MySQL database with Sequelize ORM
- 🚀 Express.js REST API
- 🔒 Password hashing with bcryptjs

## Installation

```bash
npm install node-app-v1
```

## Usage

### Running the Application

```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=8080
MYSQL_DATABASE=your_database_name
MYSQL_USERNAME=your_username
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
JWT_SECRET=your_jwt_secret_key
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires authentication)

### Bookings

- `GET /api/bookings` - Get all bookings (requires authentication)
- `POST /api/bookings` - Create a new booking (requires authentication)
- `GET /api/bookings/:id` - Get a specific booking (requires authentication)
- `PUT /api/bookings/:id` - Update a booking (requires authentication)
- `DELETE /api/bookings/:id` - Delete a booking (requires authentication)

## Project Structure

```
node-app-v1/
├── src/
│   ├── app.js              # Main application file
│   ├── config/
│   │   └── db.js           # Database configuration
│   ├── controller/
│   │   ├── auth.controller.js
│   │   └── booking.controller.js
│   ├── middleware/
│   │   └── authMiddleWare.js
│   ├── model/
│   │   ├── booking.model.js
│   │   └── users.model.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── booking.js
│   │   └── index.js
│   └── service/
│       └── emailService.js
├── package.json
└── README.md
```

## Dependencies

- **express** - Web framework
- **sequelize** - ORM for MySQL
- **mysql2** - MySQL driver
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **nodemailer** - Email service
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **uuid** - Unique identifier generation

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## License

ISC

## Author

Manish

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the [GitHub repository](https://github.com/yourusername/node-app-v1/issues).
