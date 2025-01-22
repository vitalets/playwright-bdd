import { getPackageVersion } from '../../../../../src/utils';

// 'Download trace' appears in the report in case of error in before all hook since 1.42
const pwVersion = getPackageVersion('@playwright/test');
export const hasDownloadTrace = pwVersion >= '1.42.0';
