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
import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  Page,
  SupportButton,
} from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { ProcessVariablesViewer } from './ProcessVariablesViewer';
import { ProcessGraphViewer } from './ProcessGraphViewer';
import { ProcessInstancesTable } from './ProcessInstancesTable';
import { ProcessInstance, workflow_title } from '@backstage/plugin-swf-common';
import { ProcessDetailsViewer } from './ProcessDetailsViewer';
import { ProcessTimeline } from './ProcessTimeline';
import { ProcessJobs } from './ProcessJobs';

export const SWFInstancesViewerPage = () => {
  const [selectedInstance, setSelectedInstance] = useState<ProcessInstance>();

  return (
    <Page themeId="tool">
      <Header
        title={`${workflow_title} Management`}
        subtitle={`Where all your ${workflow_title} needs come to life!`}
      >
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title={`${workflow_title} Instances`}>
          <SupportButton>Orchestrate things with stuff.</SupportButton>
        </ContentHeader>
        <Grid container direction="row">
          <Grid item xs={12} lg={8}>
            <ProcessInstancesTable
              selectedInstance={selectedInstance}
              setSelectedInstance={setSelectedInstance}
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <ProcessGraphViewer
              swfId={selectedInstance?.processId}
              selectedInstance={selectedInstance}
            />
          </Grid>
          <Grid item xs={12} lg={8}>
            <Grid container direction="row">
              <Grid item xs={12}>
                <ProcessVariablesViewer
                  variables={selectedInstance?.variables}
                />
              </Grid>
              <Grid item xs={12}>
                <ProcessTimeline selectedInstance={selectedInstance} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Grid container direction="row">
              <Grid item xs={12}>
                <ProcessDetailsViewer selectedInstance={selectedInstance} />
              </Grid>
              <Grid item xs={12}>
                <ProcessJobs selectedInstance={selectedInstance} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
