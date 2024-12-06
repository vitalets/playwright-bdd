import { When, isPlaywrightRun } from '../fixtures';
import fs from 'fs';

When(
  'the string {string} is attached as {string}',
  async function (text: string, mediaType: string) {
    if (isPlaywrightRun) {
      await this.testInfo.attach('attachment', { body: text, contentType: mediaType });
    } else {
      this.attach(text, mediaType);
    }
  },
);

When('the string {string} is logged', async function (text: string) {
  if (isPlaywrightRun) {
    await this.testInfo.attach('attachment', {
      body: text,
      contentType: 'text/x.cucumber.log+plain',
    });
  } else {
    this.log(text);
  }
});

When('text with ANSI escapes is logged', async function () {
  const body =
    'This displays a \x1b[31mr\x1b[0m\x1b[91ma\x1b[0m\x1b[33mi\x1b[0m\x1b[32mn\x1b[0m\x1b[34mb\x1b[0m\x1b[95mo\x1b[0m\x1b[35mw\x1b[0m';

  if (isPlaywrightRun) {
    await this.testInfo.attach('', {
      body,
      contentType: 'text/x.cucumber.log+plain',
    });
  } else {
    this.log(body);
  }
});

When(
  'the following string is attached as {string}:',
  async function (mediaType: string, text: string) {
    if (isPlaywrightRun) {
      await this.testInfo.attach('', { body: text, contentType: mediaType });
    } else {
      this.attach(text, mediaType);
    }
  },
);

When(
  'an array with {int} bytes is attached as {string}',
  async function (size: number, mediaType: string) {
    const data = [...Array(size).keys()];
    const buffer = Buffer.from(data);

    if (isPlaywrightRun) {
      await this.testInfo.attach('attachment', { body: buffer, contentType: mediaType });
    } else {
      this.attach(buffer, mediaType);
    }
  },
);

When('a JPEG image is attached', async function () {
  if (isPlaywrightRun) {
    await this.testInfo.attach('attachment', {
      path: __dirname + '/cucumber.jpeg',
      contentType: 'image/jpeg',
    });
  } else {
    await this.attach(fs.createReadStream(__dirname + '/cucumber.jpeg'), 'image/jpeg');
  }
});

When('a PNG image is attached', async function () {
  if (isPlaywrightRun) {
    await this.testInfo.attach('attachment', {
      path: __dirname + '/cucumber.png',
      contentType: 'image/png',
    });
  } else {
    await this.attach(fs.createReadStream(__dirname + '/cucumber.png'), 'image/png');
  }
});

When('a PDF document is attached and renamed', async function () {
  if (isPlaywrightRun) {
    await this.testInfo.attach('renamed.pdf', {
      path: __dirname + '/document.pdf',
      contentType: 'application/pdf',
    });
  } else {
    await this.attach(fs.createReadStream(__dirname + '/document.pdf'), {
      mediaType: 'application/pdf',
      fileName: 'renamed.pdf',
    });
  }
});
