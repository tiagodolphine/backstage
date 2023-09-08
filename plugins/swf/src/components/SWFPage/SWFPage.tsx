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

import React from 'react';
import { Button, Grid } from '@material-ui/core';
import { ContentHeader } from '@backstage/core-components';
import { SWFDefinitionsListComponent } from '../SWFDefinitionsListComponent';
import { workflow_title } from '@backstage/plugin-swf-common';
import { useNavigate } from 'react-router-dom';
import { useRouteRef } from '@backstage/core-plugin-api';
import { newWorkflowRef, swfInstancesRouteRef } from '../../routes';
import { BaseWorkflowPage } from '../BaseWorkflowPage/BaseWorkflowPage';
import { WorkflowSupportButton } from '../WorkflowSupportButton/WorkflowSupportButton';

export const SWFPage = () => {
  const navigate = useNavigate();
  const newWorkflowLink = useRouteRef(newWorkflowRef);
  const instancesLink = useRouteRef(swfInstancesRouteRef);

  return (
    <BaseWorkflowPage>
      <ContentHeader title="Definitions">
        <Grid container spacing={1}>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(newWorkflowLink())}
            >
              {`New ${workflow_title}`}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate(instancesLink())}
            >
              View Instances
            </Button>
          </Grid>
          <Grid item>
            <WorkflowSupportButton />
          </Grid>
        </Grid>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <SWFDefinitionsListComponent />
        </Grid>
      </Grid>
    </BaseWorkflowPage>
  );
};
