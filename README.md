# StudyHub - College Notes Exchange Platform

A full-stack web application for college students to share, download, and collaborate on academic notes.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Cloudinary account (if using file uploads)

### Backend Setup (Render Deployment)

1. **Clone repository** and navigate to `backend/` folder

2. **Create `.env` file** in backend folder:
   ```bash
   cp .env.example .env
   ```

3. **Fill in environment variables** (get from Supabase dashboard):
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key
   - `SUPABASE_ANON_KEY`: Anon key
   - `JWT_SECRET`: Any strong random string
   - `PORT`: 5001

4. **Deploy to Render**:
   - Connect this repository to Render
   - Create a Web Service
   - Set environment variables in Render dashboard  
   - Build command: `npm install`
   - Start command: `npm start`

### Frontend Setup (Netlify Deployment)

1. Navigate to `frontend/` folder

2. **Create `.env.local` file**:
   ```bash
   cp .env.example .env.local
   ```

3. **Update** `VITE_API_URL` with your Render backend URL

4. **Deploy to Netlify**:
   - Connect repository to Netlify
   - Build command: `npm run build`
   - Publish directory: `dist`

## 📋 Database Requirements

Supabase PostgreSQL tables needed:
```
- users (id, name, email, password_hash, college, semester, is_active, last_activity, ...)
- notes (id, title, description, subject, tags, uploaded_by, ...)
- comments (id, note_id, user_id, comment_text, ...)
- ratings (id, note_id, user_id, rating, ...)
- private_messages (id, sender_id, receiver_id, message, ...)
- groups (id, name, description, created_by, ...)
- notifications (id, user_id, type, title, message, ...)
- user_activity (id, user_id, action_type, ...)
```

## 🔑 Key Features

✅ Note sharing & browsing  
✅ User authentication (JWT)  
✅ Real-time notifications  
✅ Private & group chat  
✅ Ratings & comments  
✅ Study groups  
✅ Analytics dashboard  
✅ Admin panel  

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user

### Notes
- `GET /api/notes` - Browse all notes
- `POST /api/notes` - Upload new note
- `GET /api/notes/:id` - Get note details
- `DELETE /api/notes/:id` - Delete note

### Chat
- `POST /api/chat/messages` - Send message
- `GET /api/chat/contacts` - Get chat contacts

### Inactivity Management
- `POST /api/inactivity/keep-alive` - Keep account active
- `GET /api/inactivity/status` - Check inactivity status

## ⚠️ Important Notes

- **Email Service Not Configured**: This project does NOT include email notifications. Only in-app notifications work.
- **Inactive Accounts**: Users inactive for 7 days are automatically deactivated. Call `/api/inactivity/keep-alive` to reactivate.
- **Rate Limiting**: Global rate limit of 1000 requests per 15 minutes.
- **CORS**: Configure CORS with your frontend domain in production.

## 🔐 Security

- Passwords hashed with bcryptjs
- JWT token-based authentication
- SQL injection protection via prepared statements
- Rate limiting enabled
- Helmet.js security headers

## 📝 Environment Variables Guide

### Backend (.env)
```
SUPABASE_URL         - Supabase project URL
SUPABASE_SERVICE_ROLE_KEY - Service role key (backend only)
JWT_SECRET           - JWT signing secret
PORT                 - Server port (default: 5001)
NODE_ENV             - development or production
```

### Frontend (.env.local)
```
VITE_API_URL         - Backend API URL
```

## 🚀 Deployment Checklist

- [ ] Backend .env configured with Supabase keys
- [ ] Frontend .env.local has correct API_URL
- [ ] Database tables created in Supabase
- [ ] Render deployed and running
- [ ] Netlify deployed and running
- [ ] CORS configured for your domain
- [ ] Environment variables set in all platforms

## 🆘 Troubleshooting

**"Unauthorized" errors**
- Check JWT_SECRET is same on backend
- Verify token is being sent in Authorization header

**"Connection refused" errors**
- Check SUPABASE_URL is correct
- Verify Supabase keys are valid
- Ensure database tables exist

**Notes not loading**
- Check if uploaded_by field is correct
- Verify user has access to notes table

## 📞 Support

For issues, check the logs:
- Backend: `npm install` then `npm start`
- Frontend: `npm run dev` for local testing

## 📄 License

This project is provided as-is for educational purposes.
