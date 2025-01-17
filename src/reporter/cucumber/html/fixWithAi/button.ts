import { escapeHtml } from '../../../../utils';

export function getFixWithAiHtml(prompt: string) {
  const escapedPrompt = escapeHtml(JSON.stringify(prompt));
  return [
    `🤖 Fix with AI: `,
    `<button style="width: 100px" onclick='copyPrompt(this, ${escapedPrompt})'>Copy prompt</button>`,
    ` | `,
    `<a href="https://chatgpt.com/" target="_blank">Open ChatGPT</a>`,
  ].join('');
}
