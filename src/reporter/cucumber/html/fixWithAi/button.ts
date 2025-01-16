import { escapeHtml } from '../../../../utils';

export function getFixWithAiHtml(prompt: string) {
  const escapedPrompt = escapeHtml(JSON.stringify(prompt));
  const buttonTitle = 'Copy prompt';
  return [
    `🤖 Fix with AI: `,
    // eslint-disable-next-line max-len
    `<button style="width: 100px" onclick='copyPrompt(this, "${buttonTitle}", ${escapedPrompt})'>${buttonTitle}</button>`,
    ` | `,
    `<a href="https://chatgpt.com/" target="_blank">Open ChatGPT</a>`,
  ].join('');
}
