export const fetchAPI = async (url, reqBody) => {
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
  return null;
};
