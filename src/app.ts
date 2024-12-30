import app from './server';

// Ensure `PORT` is properly typed
const port = process.env.PORT || 3000; // Provide a fallback port if `PORT` is undefined

if (!process.env.PORT) {
    console.warn('PORT is not defined in environment variables. Using default port 3000.');
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

export default app;
