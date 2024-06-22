const TiList = require("../src/crdt/tilist").TiList;

describe("Create operation", () => {
  test("creating a new head", () => {
    const tiList = new TiList();
    expect(tiList.read()).toEqual("");
  });
});

describe("Insert operations", () => {
  test("inserting an element at head", async () => {
    const tiList = new TiList();
    await tiList.insert(0, "c");
    expect(tiList.read()).toEqual("c");
  });

  test("inserting an element after head", async () => {
    const tiList = new TiList();
    await tiList.insert(0, "a");
    await tiList.insert(1, "c");
    expect(tiList.read()).toEqual("ac");
  });

  test("inserting multiple elements after head", async () => {
    const tiList = new TiList();
    await tiList.insert(0, "w");
    await tiList.insert(1, "q");
    await tiList.insert(1, "b");
    expect(tiList.read()).toEqual("wbq");
  });
});

describe("Delete operations", () => {
  test("delete element at head", async () => {
    const tiList = new TiList();
    await tiList.insert(0, "q");
    await tiList.insert(1, "b");
    await tiList.delete(0);
    expect(tiList.read()).toEqual("b");
  });

  test("delete element after head", async () => {
    const tiList = new TiList();
    await tiList.insert(0, "w");
    await tiList.insert(1, "q");
    await tiList.insert(2, "b");
    await tiList.delete(1);
    expect(tiList.read()).toEqual("wb");
  });
});
