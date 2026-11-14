import { createBdd } from 'playwright-bdd';

const { BeforeStep, AfterStep } = createBdd();

BeforeStep({ name: 'attach before BDD step', tags: '@step-attachments' }, async ({ $step }) => {
  if ($step.title === 'attach text via step') {
    await $step.attach('before step attachment', { body: '|before' });
  }
});

AfterStep({ name: 'attach after BDD step', tags: '@step-attachments' }, async ({ $step }) => {
  if ($step.title === 'attach text via step') {
    await $step.info.attach('after step attachment', { body: '|after' });
  }
});
