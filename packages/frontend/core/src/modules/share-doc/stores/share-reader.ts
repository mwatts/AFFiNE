import { ErrorNames, UserFriendlyError } from '@affine/graphql';
import type { DocMode } from '@blocksuite/affine/blocks';
import { Store } from '@toeverything/infra';

import type { RawFetchProvider } from '../../cloud';
import { isBackendError } from '../../cloud';

export class ShareReaderStore extends Store {
  constructor(private readonly rawFetch?: RawFetchProvider) {
    super();
  }

  async loadShare(workspaceId: string, docId: string) {
    if (!this.rawFetch) {
      throw new Error('No Fetch Service');
    }
    try {
      const docResponse = await this.rawFetch.fetch(
        `/api/workspaces/${workspaceId}/docs/${docId}`
      );
      const publishMode = docResponse.headers.get(
        'publish-mode'
      ) as DocMode | null;
      const docBinary = await docResponse.arrayBuffer();

      const workspaceResponse = await this.rawFetch.fetch(
        `/api/workspaces/${workspaceId}/docs/${workspaceId}`
      );
      const workspaceBinary = await workspaceResponse.arrayBuffer();

      return {
        doc: new Uint8Array(docBinary),
        workspace: new Uint8Array(workspaceBinary),
        publishMode,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        isBackendError(error) &&
        UserFriendlyError.fromAnyError(error).name === ErrorNames.ACCESS_DENIED
      ) {
        return null;
      }
      throw error;
    }
  }
}
