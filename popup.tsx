import { DateTime } from "luxon";
import slugify from "slugify";
import { useEffect, useState } from "react"
import { useStorage } from '@plasmohq/storage';
import "./popup.css";

function IndexPopup() {
  const [ isLoading, setIsLoading ] = useState(true);
  const [ archiveState, setArchiveState ] = useState<'unarchived' | 'archiving' | 'archived' | 'failed'>('unarchived');
  const [ summariseState, setSummariseState ] = useState<'unsummarised' | 'summarising' | 'summarised' | 'failed'>('unsummarised');
  const [ smmryKey, setSmmryKey ] = useStorage('smmryKey', '');
  const [ summary, setSummary ] = useState("");
  const [ content, setContent ] = useState("");
  const [ _title, _setTitle ] = useState("");

  const archive = async () => {
    setArchiveState('archiving');
    const [ tab ] = await chrome.tabs.query({ active: true, currentWindow: true });
    const { url } = tab;
    // Save to wayback machine
    try {
      await fetch('https://web.archive.org/save/' + url);
      setArchiveState('archived');
    } catch (error) {
      setArchiveState('failed');
    }
  };

  const summarise = async () => {
    setSummariseState('summarising');

    const [ tab ] = await chrome.tabs.query({ active: true, currentWindow: true });
    const { url } = tab;

    let key = smmryKey;

    if (!key)
      key = prompt('Please enter an API key from https://smmry.com/partner');

    if (!key) {
      setSummariseState('failed');
      return;
    }
    setSmmryKey(key);

    try {
      const response = await fetch(`https://api.smmry.com/&SM_API_KEY=${key}&SM_URL=${url}`);
      const smData = await response.json();
      console.log(smData);

      if (smData?.sm_api_error)
        throw new Error(smData?.sm_api_message);
      
      setSummary(smData?.sm_api_content || '');
      setSummariseState('summarised');
    } catch (error) {
      alert(error.message);
      setSummariseState('failed');
    }
  };

  useEffect(() => {
    (async () => {
      const [ tab ] = await chrome.tabs.query({ active: true, currentWindow: true });
      const { url, title } = tab;
      const date = DateTime.now();

      const { description, title: metaTitle } : { description?: string, title?: string } = await new Promise(resolve => chrome.tabs.sendMessage(tab.id, null, resolve));

      _setTitle(metaTitle || title);
      setContent(`---
title: ${metaTitle || title}
date: ${date.toString()}
public: true
listed: true
---

[Original](${url})
[Archive](https://web.archive.org/web/${date.toFormat('yyyyMMddHHmmss')}/${url})${description ? `\n\n## Description\n\n${description}` : ''}${summary ? `\n\n## Summary\n\n${summary}` : ''}

## Notes

`);
      setIsLoading(false);
    })();
  }, [ summary ]);

  const download = async () => {
    const [ tab ] = await chrome.tabs.query({ active: true, currentWindow: true });
    const { url } = tab;

    const slug = slugify(_title || new URL(url).hostname || 'bookmark', { strict: true, lower: true });
    const filename = `bookmarks/${slug}.md`;

    // Download text as file
    const downloadId = await chrome.downloads.download({
      url: URL.createObjectURL(new Blob([content], { type: "text/markdown; charset=UTF-8" })),
      filename,
      saveAs: true,
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginTop: 16,
        marginBottom: 16,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <p>Archive status: {archiveState}</p>
          <button disabled={archiveState !== 'unarchived' && archiveState !== 'failed'} style={{
            display: 'inline',
            width: '30%',
          }} onClick={archive}>Archive</button>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <p>Summary status: {summariseState}</p>
          <button disabled={summariseState !== 'unsummarised' && summariseState !== 'failed'} style={{
            display: 'inline',
            width: '30%',
          }} onClick={summarise}>Summarise</button>
        </div>
      </div>
      <textarea onChange={(e) => setContent(e.target.value)} value={content} rows={10} cols={50} />
      <button style={{
        marginTop: 16,
      }} onClick={download}>Download</button>
    </div>
  )
}

export default IndexPopup
