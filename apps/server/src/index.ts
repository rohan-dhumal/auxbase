import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes"

const app = express();
const APP_PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
    return res.json({
        status: 'ok',
        message: 'Auxbase API is running'
    });
});

app.listen(APP_PORT, () => {
    console.log(`Auxbase server is running on port ${APP_PORT}`);
});

export default app;