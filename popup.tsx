import { useState } from "react"

function IndexPopup() {
  const [data, setData] = useState("")

  const download = async (filename, content) => {
    // Download text as file
    const downloadId = await chrome.downloads.download({
      url: URL.createObjectURL(new Blob([content], { type: "text/markdown; charset=UTF-8" })),
      filename,
    });

    console.log(downloadId);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <h1>
        Welcome to your <a href="https://www.plasmo.com">Plasmo</a> Extension!
      </h1>
      <input onChange={(e) => setData(e.target.value)} value={data} />
      <button onClick={() => download('bookmarks/text.txt', 'Hi there')}>Download</button>
    </div>
  )
}

export default IndexPopup
