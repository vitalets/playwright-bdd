import { When } from '../fixtures';

When(
  'the string {string} is attached as {string}',
  async function (text: string, mediaType: string) {
    await this.testInfo.attach('attachment', { body: text, contentType: mediaType });
  },
);

When('the string {string} is logged', async function (text: string) {
  await this.testInfo.attach('attachment', {
    body: text,
    contentType: 'text/x.cucumber.log+plain',
  });
});

When('text with ANSI escapes is logged', async function () {
  await this.testInfo.attach('', {
    body: 'This displays a \x1b[31mr\x1b[0m\x1b[91ma\x1b[0m\x1b[33mi\x1b[0m\x1b[32mn\x1b[0m\x1b[34mb\x1b[0m\x1b[95mo\x1b[0m\x1b[35mw\x1b[0m',
    contentType: 'text/x.cucumber.log+plain',
  });
});

When(
  'the following string is attached as {string}:',
  async function (mediaType: string, text: string) {
    await this.testInfo.attach('', { body: text, contentType: mediaType });
  },
);

When(
  'an array with {int} bytes is attached as {string}',
  async function (size: number, mediaType: string) {
    const data = [...Array(size).keys()];
    const buffer = Buffer.from(data);
    await this.testInfo.attach('attachment', { body: buffer, contentType: mediaType });
  },
);

When('a JPEG image is attached', async function () {
  await this.testInfo.attach('attachment', {
    path: __dirname + '/cucumber.jpeg',
    contentType: 'image/jpeg',
  });
});

When('a PNG image is attached', async function () {
  await this.testInfo.attach('attachment', {
    path: __dirname + '/cucumber.png',
    contentType: 'image/png',
  });
});

When('a PDF document is attached and renamed', async function () {
  await this.testInfo.attach('renamed.pdf', {
    path: __dirname + '/document.pdf',
    contentType: 'application/pdf',
  });
});
