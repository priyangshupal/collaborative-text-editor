const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

// For reading selected range by the caret
const rangeElement = document.getElementById("range");

// Set quill object
const quill = new Quill("#editor", {
  theme: "snow",
  modules: { toolbar: false },
});

// This event listener listens for any changes in the editor
quill.on("editor-change", (eventName, ...args) => {
  if (eventName === "text-change") {
    localSave(rangeElement.innerText, args[0].ops);
  } else if (eventName === "selection-change") {
    updateSelection(args);
  }
});

const localSave = (range, opertionsList) => {
  const localSaveOptions = {
    modifiedRange: "",
    modification: "",
  };
  let operationType = "";
  for (let i = 0; i < opertionsList.length; i++) {
    const operation = opertionsList[i];
    if ("insert" in operation) {
      operationType = "insert";
      console.log(`insert operation:`, operation);
      localSaveOptions.modifiedRange = parseInt(range);
      localSaveOptions.modification = operation['insert'];
    } else if ("delete" in operation) {
      operationType = "delete";
      localSaveOptions.modifiedRange = range == 0 ? 0 : range - 1;
    }
  }
  fetchAPI(`http://localhost:8080/${operationType}`, localSaveOptions);
};

const updateSelection = (selection) => {
  // if a range is selected, format => startIndex - endIndex
  // if one positon is selected, format => index of caret
  if (selection[0] != null) {
    const range =
      selection[0].index +
      (selection[0].length > 0 && `-${selection[0].length - 1}`);
    rangeElement.innerText = range;
  }
};

const fetchAPI = async (url, reqBody) => {
  console.log(`calling ${url}, req body: `, reqBody);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
    });
    const data = await response.json();
    console.log(`recieved response from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`error while calling ${url}: ${error}`);
  }
};
