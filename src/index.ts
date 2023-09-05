import "dotenv/config";
import express from "express";
import cors from "cors"
import debtRoutes from "./routes/debtRoutes"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors())
app.use(express.json());
app.use(debtRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
