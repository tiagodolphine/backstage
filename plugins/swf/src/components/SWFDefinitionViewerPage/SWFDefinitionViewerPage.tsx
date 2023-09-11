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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouteRef, useRouteRefParams } from '@backstage/core-plugin-api';
import { definitionsRouteRef, executeWorkflowRouteRef } from '../../routes';
import { ContentHeader, InfoCard, Progress } from '@backstage/core-components';
import { Button, Grid } from '@material-ui/core';
import { SWFEditor } from '../SWFEditor';
import { EditorViewKind, SWFEditorRef } from '../SWFEditor/SWFEditor';
import { useController } from '@kie-tools-core/react-hooks/dist/useController';
import { useNavigate } from 'react-router-dom';
import { BaseWorkflowPage } from '../BaseWorkflowPage/BaseWorkflowPage';
import { WorkflowSupportButton } from '../WorkflowSupportButton/WorkflowSupportButton';

export const SWFDefinitionViewerPage = () => {
  const [name, setName] = useState<string>();
  const { swfId, format } = useRouteRefParams(definitionsRouteRef);
  const [swfEditor, swfEditorRef] = useController<SWFEditorRef>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);

  const workflowFormat = useMemo(
    () => (format === 'json' ? 'json' : 'yaml'),
    [format],
  );

  useEffect(() => {
    if (!swfEditor?.swfItem) {
      return;
    }
    setLoading(false);
    setName(swfEditor.swfItem.definition.name);
  }, [swfEditor]);

  const onExecute = useCallback(() => {
    navigate(executeWorkflowLink({ swfId: swfId }));
  }, [executeWorkflowLink, navigate, swfId]);

  return (
    <BaseWorkflowPage>
      <ContentHeader title="Definition">
        <WorkflowSupportButton />
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          {loading && <Progress />}
          <InfoCard
            title={name}
            action={
              <Button
                color="primary"
                variant="contained"
                style={{ marginTop: 8, marginRight: 8 }}
                onClick={() => onExecute()}
              >
                Execute
              </Button>
            }
          >
            <div style={{ height: '600px' }}>
              <SWFEditor
                ref={swfEditorRef}
                kind={EditorViewKind.EXTENDED_DIAGRAM_VIEWER}
                swfId={swfId}
                format={workflowFormat}
              />
            </div>
          </InfoCard>
        </Grid>
      </Grid>
    </BaseWorkflowPage>
  );
};
