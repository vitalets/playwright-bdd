/**
 * Timing utils.
 */
import { TimeConversion } from '@cucumber/messages';

export type TimeMeasured = {
  startTime: Date;
  duration: number;
};

export function toCucumberTimestamp(time: number) {
  return TimeConversion.millisecondsSinceEpochToTimestamp(time);
}

export function calcMinMaxByArray(items: TimeMeasured[]) {
  let startTime: Date = items.length > 0 ? items[0].startTime : new Date();
  let endTime: Date = items.length > 0 ? getEndTime(items[0]) : new Date();

  items.forEach((item) => {
    const resultEndTime = getEndTime(item);
    if (item.startTime < startTime) startTime = item.startTime;
    if (resultEndTime > endTime) endTime = resultEndTime;
  });

  return {
    startTime,
    duration: endTime.getTime() - startTime.getTime(),
  };
}

function getEndTime(entity: TimeMeasured) {
  return new Date(entity.startTime.getTime() + entity.duration);
}
