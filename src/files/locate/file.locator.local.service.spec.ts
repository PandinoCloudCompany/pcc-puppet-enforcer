import { Logger } from '@nestjs/common';
import { fileResource } from '../../__mocks__/file.resource.mock.js';
import { FileLocatorLocalService } from './file.locator.local.service.js';

describe('Fetch Local CSV File', () => {
  let fileLocatorLocalService: FileLocatorLocalService;

  beforeEach(async () => {
    fileLocatorLocalService = new FileLocatorLocalService(new Logger());
  });

  describe('read local file', () => {
    it('should validate file from local file system', async () => {
      const downloaded = await fileLocatorLocalService.downloadBytes(
        fileResource,
      );
      expect(downloaded).toBeTruthy();
      expect(downloaded).toEqual(fileResource.remotePath);
    });
  });
});
