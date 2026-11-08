# real-time
real-time chat application using mern stack

## Production environment

Configure these environment variables for the backend deployment:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLIENT_URL` (optional): comma-separated frontend origins allowed to connect
  to Socket.IO. The deployed frontend and `http://localhost:5173` are allowed
  by default.

The backend requires these Cloudinary values to start because profile photo
uploads are stored there. Keep the API secret out of source control and rotate
any Cloudinary credentials that were previously committed.
