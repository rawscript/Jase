# Deployment Guide

This guide covers deploying the portfolio website to various platforms.

## Environment Variables

Ensure these environment variables are set:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to "production" for production deployments
- `PORT` - Server port (optional, defaults to 5000)

## Deployment Platforms

### 1. Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Set environment variables in Vercel dashboard
4. Add build command: `npm run build`
5. Set output directory: `dist`

### 2. Netlify

1. Connect your repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist/public`
4. Set environment variables in Netlify dashboard

### 3. Railway

1. Connect your repository to Railway
2. Set environment variables
3. Railway will automatically detect and deploy

### 4. Heroku

1. Create a Heroku app
2. Set environment variables: `heroku config:set DATABASE_URL=your_url`
3. Add Procfile: `web: npm start`
4. Deploy: `git push heroku main`

### 5. DigitalOcean App Platform

1. Create a new app from your repository
2. Set environment variables
3. Configure build and run commands
4. Deploy

### 6. VPS/Server Deployment

1. Clone repository: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Set environment variables: `export DATABASE_URL=your_url`
4. Build: `npm run build`
5. Start: `npm start`
6. Use PM2 for process management: `pm2 start dist/index.js`

## Database Setup

### Supabase (Recommended)
1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database → Connection pooling
3. Set as DATABASE_URL environment variable
4. Run: `npm run db:push` to create tables

### Other PostgreSQL Providers
- **Neon**: [neon.tech](https://neon.tech)
- **PlanetScale**: [planetscale.com](https://planetscale.com)
- **AWS RDS**: Amazon RDS for PostgreSQL
- **Google Cloud SQL**: Google Cloud SQL for PostgreSQL

## Production Checklist

- [ ] Environment variables set
- [ ] Database connection working
- [ ] Build process successful
- [ ] SSL certificate configured
- [ ] Domain configured (if applicable)
- [ ] Error monitoring set up
- [ ] Performance monitoring set up
- [ ] Backup strategy implemented

## Performance Optimization

1. **Enable compression**: Use gzip compression
2. **CDN**: Use a CDN for static assets
3. **Database optimization**: Use connection pooling
4. **Caching**: Implement Redis for session storage
5. **Monitoring**: Use tools like New Relic or DataDog

## Security Considerations

1. **Environment variables**: Never commit sensitive data
2. **HTTPS**: Always use HTTPS in production
3. **Headers**: Set security headers
4. **Rate limiting**: Implement rate limiting for API endpoints
5. **Input validation**: Validate all user inputs

## Troubleshooting

### Common Issues

1. **Database connection fails**
   - Check DATABASE_URL format
   - Verify database is accessible
   - Check firewall settings

2. **Build fails**
   - Check Node.js version (18+)
   - Verify all dependencies installed
   - Check for TypeScript errors

3. **App crashes in production**
   - Check environment variables
   - Review server logs
   - Verify database schema is pushed

### Logs

Check application logs for debugging:
- Vercel: `vercel logs`
- Heroku: `heroku logs --tail`
- Railway: Check Railway dashboard
- PM2: `pm2 logs`