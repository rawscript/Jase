<<<<<<< HEAD
# Jase
James' portfolio
=======
# Portfolio Website

A modern, full-stack portfolio website built with React, TypeScript, Express.js, and PostgreSQL. Features an elegant, minimalist design with contact form functionality and database persistence.

## Features

- **Modern Tech Stack**: React 18, TypeScript, Express.js, PostgreSQL
- **Elegant Design**: Premium minimalist aesthetic with white background and black accents
- **Responsive**: Works perfectly on desktop and mobile devices
- **Database Integration**: PostgreSQL with Drizzle ORM for contact form persistence
- **Interactive Components**: Smooth animations, skill bars, project filtering
- **Contact Form**: Validated form with database storage

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase or any PostgreSQL provider)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_postgresql_connection_string
```

For Supabase:
- Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
- Create a new project
- Get your connection string from Connect → Transaction pooler
- Replace `[YOUR-PASSWORD]` with your actual password

4. Set up the database:
```bash
npm run db:push
```

## Development

Start the development server:
```bash
npm run dev
```

This will start:
- Express server on port 5000
- Vite development server with hot reloading
- Automatic database connection

Visit `http://localhost:5000` to view the application.

## Production

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The application will be available at `http://localhost:5000`.

## Database Commands

- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migration files
- `npm run db:studio` - Open Drizzle Studio for database management

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities and configuration
│   │   └── hooks/        # Custom React hooks
├── server/               # Express backend
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API routes
│   ├── db.ts            # Database configuration
│   └── storage.ts        # Database operations
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and types
└── dist/                 # Built application
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (optional, defaults to 5000)

## Technologies Used

### Frontend
- React 18 with TypeScript
- Vite for development and building
- TailwindCSS for styling
- shadcn/ui components
- Framer Motion for animations
- React Hook Form with Zod validation
- TanStack Query for state management

### Backend
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- Zod for validation
- Session management

### Development Tools
- TypeScript with strict configuration
- ESLint and Prettier
- Drizzle Kit for database management

## Customization

1. **Styling**: Update `client/src/index.css` for theme colors
2. **Content**: Modify components in `client/src/components/`
3. **Database**: Update schema in `shared/schema.ts`
4. **API**: Add routes in `server/routes.ts`

## License

MIT License
>>>>>>> 35e141b (Configure the website for deployment outside of the Replit environment)
