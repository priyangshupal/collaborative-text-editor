import {
  ATTRIBUTES,
  DELETE_OPERATION,
  HOST_URL,
  INSERT_OPERATION,
  RETAIN_OPERATION,
  RICHTEXT_OPERATION,
} from "../constants";
import { fetchAPI } from "./fetchAPI";

export const localSave = async ({ operationsList, replicaId }) => {
  const localSaveOptions = {
    modifiedIndex: 0,
    modifiedLength: 1,
    modification: "",
    attributes: null,
    replicaId: replicaId,
  };
  let operationType = "";
  for (let i = 0; i < operationsList.length; i++) {
    const operation = operationsList[i];
    if (INSERT_OPERATION in operation) {
      operationType = INSERT_OPERATION;
      localSaveOptions.modification = operation[operationType]; // character to be inserted
      localSaveOptions.modifiedLength = operation[operationType].length;
    } else if (DELETE_OPERATION in operation) {
      operationType = DELETE_OPERATION;
      localSaveOptions.modifiedLength = operation[operationType];
    } else if (RETAIN_OPERATION in operation) {
      /**
       * `retain` can imply two scenarios:
       * 1. the starting index of the operation => `attributes` not present within operation
       * 2. the length of modfication by the operation => `attributes` present within operation
       */
      // if it contains `attributes`, add length of operation and type of operation
      if (ATTRIBUTES in operation) {
        operationType = RICHTEXT_OPERATION;
        localSaveOptions.modifiedLength = operation[RETAIN_OPERATION];
        localSaveOptions.attributes = operation[ATTRIBUTES];
        continue;
      }
      localSaveOptions.modifiedIndex = operation[RETAIN_OPERATION]; // add the position of operation
    }
  }
  // return the locally saved content
  return await fetchAPI(`${HOST_URL}/${operationType}`, localSaveOptions);
};
