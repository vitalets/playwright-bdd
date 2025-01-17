/**
 * Custom script - setup "Fix with AI" button click handlers.
 */
export const fixWithAiScript = `
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

/**
 * Custom css - hide LOG for "Fix with AI" button
 */
export const fixWithAiCss = `
<style>
pre:has(button) {
  padding-left: 0.75em !important;
}
pre:has(button)::before {
  content: none !important;
}
</style>
`;
