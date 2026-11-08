# real-time
real-time chat application using mern stack

## Production environment

Configure these environment variables for the backend deployment:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

The backend requires these Cloudinary values to start because profile photo
uploads are stored there. Keep the API secret out of source control and rotate
any Cloudinary credentials that were previously committed.
