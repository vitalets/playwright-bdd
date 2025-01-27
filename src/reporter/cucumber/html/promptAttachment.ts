/**
 * Extra attachment with button that copies prompt to clipboard.
 */
import { escapeHtml } from '../../../utils';
import { createLogAttachment } from '../attachments/helpers';

export function createPromptAttachmentWithButton(
  testCaseStartedId: string | undefined,
  testStepId: string | undefined,
  prompt: string,
) {
  const html = createPromptAttachmentHtml(prompt);
  return createLogAttachment(testCaseStartedId, testStepId, html);
}

function createPromptAttachmentHtml(prompt: string) {
  const escapedPrompt = escapeHtml(JSON.stringify(prompt));
  return [
    `<button data-custom-html style="width: 100px" onclick='copyPrompt(this, ${escapedPrompt})'>Copy prompt</button>`,
    `<a href="https://chatgpt.com/" target="_blank">Open ChatGPT</a>`,
  ].join(' | ');
}

/**
 * Custom script - setup "Copy prompt" button click handlers.
 */
export const scriptCopyPrompt = `
<script>
function copyPrompt(button, prompt) {
  var originalText = button.textContent;
  if (originalText === 'Copied') return;
  navigator.clipboard.writeText(prompt).then(() => {
    button.textContent = 'Copied';
    setTimeout(() => button.textContent = originalText, 2000);
  });
}
</script>
`;
