# Corporate Survey Platform

A full-stack web application for creating and managing corporate surveys, built with Next.js and Node.js.

## Features

- User Authentication & Authorization
- Survey Creation and Management
- Dynamic Question Types
- Real-time Survey Responses
- Admin Dashboard
- Responsive Design

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- React Query

### Backend
- Node.js
- Express
- TypeScript
- MongoDB
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/corp-survey.git
cd corp-survey

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
 ```

3. Environment Setup
Create .env files in both frontend and backend directories:

Backend .env :

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=3001
 ```

Frontend .env :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
 ```

 4. Start the Development Servers
Backend:

```bash
cd backend
npm run dev
 ```

Frontend:

```bash
cd frontend
npm run dev
 ```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001


## Docker Deployment

### Prerequisites
- Docker
- Docker Compose

### Running with Docker

1. Start the application using Docker Compose:
```bash
docker-compose up --build
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Contributing
1. Fork the repository
2. Create your feature branch ( git checkout -b feature/AmazingFeature )
3. Commit your changes ( git commit -m 'Add some AmazingFeature' )
4. Push to the branch ( git push origin feature/AmazingFeature )
5. Open a Pull Request
## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
- @corp-surver
