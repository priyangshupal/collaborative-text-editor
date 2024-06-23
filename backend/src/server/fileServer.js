import { deserializeTiList } from "../utils/deserializeTiList.js";
import { writeToFile } from "../utils/fileOperations.js";
import { FILEPATH } from "../constants.js";
import express from "express";
import cors from "cors";

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.post("/insert", (req, res) => {
  const reqBody = req.body;
  console.log("/insert called:", reqBody);
  deserializeTiList(FILEPATH, (tiListHead) => {
    // insert into the list after it is deserialized
    tiListHead.insert(reqBody["modifiedRange"], reqBody["modification"]);
    writeToFile(tiListHead.toString(), FILEPATH);
    res.send({ message: "success" });
  });
});

app.post("/delete", (req, res) => {
  const reqBody = req.body;
  console.log("/delete called:", reqBody);
  deserializeTiList(FILEPATH, (tiListHead) => {
    // delete from the list after it is deserialized
    tiListHead.delete(reqBody["modifiedRange"]);
    writeToFile(tiListHead.toString(), FILEPATH);
    res.send({ message: "success" });
  });
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
