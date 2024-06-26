import { deserializeTiList } from "../utils/deserializeTiList.js";
import { writeToFile } from "../utils/fileOperations.js";
import { getStorePath } from "../utils/getStorePath.js";
import express from "express";
import cors from "cors";

const port = 8080;
const app = express();

app.use(cors());
app.use(express.json());

app.post("/insert", (req, res) => {
  const reqBody = req.body;
  console.log("/insert called, reqBody:", reqBody);
  deserializeTiList(
    getStorePath(reqBody.replicaId),
    reqBody.replicaId,
    (tiList) => {
      // insert into the list after it is deserialized
      tiList.insert(reqBody["modifiedRange"], reqBody["modification"]);
      writeToFile(tiList.toString(), getStorePath(reqBody.replicaId));
      res.send({ curContent: tiList.read() });
    }
  );
});

app.post("/delete", (req, res) => {
  const reqBody = req.body;
  console.log("/delete called, reqBody:", reqBody);
  deserializeTiList(
    getStorePath(reqBody.replicaId),
    reqBody.replicaId,
    (tiList) => {
      // delete from the list after it is deserialized
      tiList.delete(reqBody["modifiedRange"]);
      writeToFile(tiList.toString(), getStorePath(reqBody.replicaId));
      res.send({ curContent: tiList.read() });
    }
  );
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
