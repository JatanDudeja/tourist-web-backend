import app from "./app.js";
import connectToDB from "./database/index.js";
import "dotenv/config";

const PORT = process.env.PORT || 3000;

connectToDB()
.then(() => {
  app.listen(PORT, () => {
    console.log("Listening on Port: ", PORT);
  })
})
.catch((err) => {
    throw new Error(`Error came either in conneting with DB or starting the server!\nError: ${err}.`)
})
