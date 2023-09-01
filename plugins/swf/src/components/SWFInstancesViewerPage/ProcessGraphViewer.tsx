/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useState } from 'react';

import { InfoCard } from '@backstage/core-components';
import { ProcessInstance } from '@backstage/plugin-swf-common';
import { SWFEditor } from '../SWFEditor';
import { EditorViewKind } from '../SWFEditor/SWFEditor';
import { Button } from '@material-ui/core';
import { SWFDialog } from '../SWFDialog';

interface ProcessGraphViewerProps {
  swfId: string | undefined;
  selectedInstance: ProcessInstance | undefined;
}

export const ProcessGraphViewer = (props: ProcessGraphViewerProps) => {
  const { swfId, selectedInstance } = props;
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <InfoCard
        title="Status"
        action={
          swfId &&
          selectedInstance && (
            <Button
              color="default"
              type="submit"
              variant="outlined"
              style={{ marginTop: 8, marginRight: 8 }}
              onClick={() => setOpen(true)}
            >
              Expand
            </Button>
          )
        }
      >
        <div style={{ height: '500px', padding: '10px' }}>
          {!swfId || !selectedInstance ? (
            <p>No instance selected</p>
          ) : (
            <SWFEditor
              kind={EditorViewKind.RUNTIME}
              processInstance={selectedInstance}
              swfId={swfId}
            />
          )}
        </div>
      </InfoCard>
      {swfId && selectedInstance && (
        <SWFDialog
          swfId={swfId}
          kind={EditorViewKind.RUNTIME}
          processInstance={selectedInstance}
          title={selectedInstance.processName ?? selectedInstance.processId}
          open={open}
          close={() => setOpen(false)}
        />
      )}
    </>
  );
};
