import express from "express";
import { Request, Response } from "express";
import { handleGetm3u } from "./handler/getm3u";

const app = express();
const port = 3000;

app.get("/getm3u", async (req: Request, res: Response) => {
  try {
    await handleGetm3u({ req: req, res: res });
  } catch (e) {
    console.log("Error in /getm3u:", e);
    res.status(500).send(e);
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(
    `m3u filter server started on port ${port}.`
  );
});
