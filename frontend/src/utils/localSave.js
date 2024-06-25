import {
  DELETE_OPERATION,
  HOST_URL,
  INSERT_OPERATION,
  RETAIN_OPERATION,
} from "../constants";
import { fetchAPI } from "./fetchAPI";

export const localSave = ({ operationsList, replicaId }) => {
  const localSaveOptions = {
    modifiedRange: 0,
    modification: "",
    replicaId: replicaId,
  };
  let operationType = "";
  for (let i = 0; i < operationsList.length; i++) {
    const operation = operationsList[i];
    if (INSERT_OPERATION in operation) {
      operationType = INSERT_OPERATION;
      localSaveOptions.modification = operation[operationType]; // character to be inserted
    } else if (DELETE_OPERATION in operation) {
      operationType = DELETE_OPERATION;
    } else if (RETAIN_OPERATION in operation) {
      operationType = RETAIN_OPERATION;
      localSaveOptions.modifiedRange = operation[operationType]; // position of insertion
    }
  }
  fetchAPI(`${HOST_URL}/${operationType}`, localSaveOptions);
};
