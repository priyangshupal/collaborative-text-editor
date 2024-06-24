import { fetchAPI } from "./fetchAPI";

export const localSave = (opertionsList) => {
  const localSaveOptions = {
    modifiedRange: 0,
    modification: "",
  };
  let operationType = "";
  for (let i = 0; i < opertionsList.length; i++) {
    const operation = opertionsList[i];
    if ("insert" in operation) {
      console.log(`insert operation:`, operation);
      operationType = "insert";
      localSaveOptions.modification = operation["insert"]; // character to be inserted
    } else if ("delete" in operation) {
      console.log(`delete operation:`, operation);
      operationType = "delete";
    } else if ("retain" in operation) {
      localSaveOptions.modifiedRange = operation["retain"]; // position of insertion
    }
  }
  fetchAPI(`http://localhost:8080/${operationType}`, localSaveOptions);
};
