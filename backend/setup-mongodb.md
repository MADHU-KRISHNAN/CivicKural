# MongoDB Setup Guide

## 🚀 Quick Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended) ⭐
**Best for: Development and Production**

1. **Sign up for MongoDB Atlas** (Free): https://www.mongodb.com/atlas
2. **Create a free cluster**
3. **Get your connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
4. **Update your .env file**:
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/samvad-civic-connect?retryWrites=true&w=majority
   ```
5. **Replace `username` and `password` with your credentials**

### Option 2: Local MongoDB Installation
**Best for: Development only**

#### Windows Installation:
1. **Download MongoDB Community Server**: https://www.mongodb.com/download-center/community
2. **Install MongoDB** (choose "Complete" installation)
3. **Start MongoDB service**:
   ```powershell
   # Check if MongoDB is running
   Get-Service -Name MongoDB*
   
   # Start MongoDB service
   Start-Service -Name MongoDB
   ```
4. **Your .env file should work as-is**:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/samvad-civic-connect
   ```

### Option 3: MongoDB with Docker
**Best for: Quick development setup**

1. **Install Docker Desktop**: https://www.docker.com/products/docker-desktop
2. **Run MongoDB container**:
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```
3. **Use default connection string**:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/samvad-civic-connect
   ```

## 🧪 Test Your Setup

After setting up MongoDB, test the connection:

```bash
# Start the backend server
npm run dev
```

You should see:
```
🚀 Samvad Civic Connect Backend Server Started!
📊 MongoDB: Connected
```

## 🆘 Still Having Issues?

If you're still having connection issues, the server will now start anyway and show helpful error messages. You can:

1. **Check the logs** - They'll tell you exactly what's wrong
2. **Temporarily comment out MONGODB_URI** in .env to run in demo mode
3. **Use the health check endpoint**: http://localhost:5000/health

## ⚡ Quick Start (No Database)

Want to test the API without setting up MongoDB right now?

1. **Comment out or remove the MONGODB_URI line** in your `.env` file
2. **Start the server**: `npm run dev`
3. **The server will run in demo mode** (some endpoints won't work, but you can test the structure)

Choose the option that works best for you!