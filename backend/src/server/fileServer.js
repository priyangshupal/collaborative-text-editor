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
      for (let i = 0; i < reqBody["modifiedLength"]; i++) {
        tiList.insert(reqBody["modifiedIndex"] + i, reqBody["modification"][i]);
      }
      writeToFile(
        tiList.toString(), // serialized TiList
        getStorePath(reqBody.replicaId)
      );
      res.send({curContent: tiList.getContentsForEditor()});
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
      for (let i = 0; i < reqBody["modifiedLength"]; i++) {
        tiList.delete(reqBody["modifiedIndex"]);
      }
      writeToFile(
        tiList.toString(), // serialized TiList
        getStorePath(reqBody.replicaId)
      );
      res.send({curContent: tiList.getContentsForEditor()});
    }
  );
});

app.post("/richtext", (req, res) => {
  const reqBody = req.body;
  console.log(`/richtext called, reqBody:`, reqBody);
  deserializeTiList(
    getStorePath(reqBody.replicaId),
    reqBody.replicaId,
    (tiList) => {
      // insert into the list after it is deserialized

      // start of `attribute`
      tiList.insert(
        reqBody["modifiedIndex"],
        reqBody["modification"],
        reqBody["attributes"]
      );

      // end of `attribute`
      tiList.insert(
        reqBody["modifiedIndex"] + reqBody["modifiedLength"],
        reqBody["modification"],
        reqBody["attributes"]
      );
      writeToFile(
        tiList.toString(), // serialized TiList
        getStorePath(reqBody.replicaId)
      );
      res.send({curContent: tiList.getContentsForEditor()});
    }
  );
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
