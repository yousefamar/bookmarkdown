import type { PlasmoContentScript } from "plasmo";

export const config: PlasmoContentScript = {
  matches: ["<all_urls>"],
  all_frames: true,
};

const metaTags = [
  "description",
  "og:description",
  "summary",
  "abstract",
  "topic",

  "og:title",
  "og:site_name",

  // "og:type",
  // "og:url",
  // "og:image",
];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const info = {};

  for (const tag of metaTags)
    info[tag] = (document.querySelector(`meta[${tag.startsWith('og:') ? 'property' : 'name'}="${tag}"]`) as HTMLMetaElement)?.content;

  sendResponse({
    description: info['description'] || info['og:description'] || info['summary'] || info['abstract'] || info['topic'],
    title: info['og:title'] || info['og:site_name'],
  });

  return true;
});