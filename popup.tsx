import { DateTime } from "luxon";
import { useEffect, useState } from "react"
import "./popup.css";

function IndexPopup() {
  const [ isLoading, setIsLoading ] = useState(true);
  const [ archiveState, setArchiveState ] = useState<'archiving' | 'archived' | 'failed'>('archiving');
  const [ content, setContent ] = useState("");

  useEffect(() => {
    (async () => {
      const [ tab ] = await chrome.tabs.query({ active: true, currentWindow: true });
      const { url, title } = tab;
      const date = DateTime.now();
      console.log(tab);

      // Save to wayback machine
      // fetch('https://web.archive.org/save/' + url).then(() => {
      //   setArchiveState('archived');
      // }).catch(() => {
      //   setArchiveState('failed');
      // });

      setContent(`---
title: ${title}
date: ${date.toString()}
breadcrumbs: true
public: true
listed: true
---

Original URL: ${url}
Archive URL: https://web.archive.org/web/${date.toFormat('yyyyMMddHHmmss')}/${url}


      `)
      setIsLoading(false);
    })();
  }, []);

  const download = async () => {
    const filename = 'bookmarks/test.md';

    // Download text as file
    const downloadId = await chrome.downloads.download({
      url: URL.createObjectURL(new Blob([content], { type: "text/markdown; charset=UTF-8" })),
      filename,
    });

    console.log(downloadId);
  };

  if (isLoading)
    return <>
      <div style={{ marginBottom: 0 }} className="loading"></div>
      <p style={{
        padding: 10,
        textAlign: "center",
      }}>Generating markdown...</p>
    </>

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <h4 style={{
        margin: 0,
      }}>
        Bookmarkdown
      </h4>
      <p>Archive status: { archiveState }</p>
      <textarea onChange={(e) => setContent(e.target.value)} value={content} rows={10} cols={50} />
      <button style={{
        marginTop: 16,
      }} onClick={download}>Download</button>
    </div>
  )
}

export default IndexPopup
