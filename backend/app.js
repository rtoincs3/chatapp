import express from "express"
import userRouter from "./routes/userRoute.js"


// app intialization
const app = express()

// middlewares
app.use(express.json())


// auth 
app.use("/api/auth", userRouter)

app.post('/direct-test', (req, res) => {
  console.log('Direct test route HIT!');
  res.json({ message: 'This route works - server is alive' });
});

export default app