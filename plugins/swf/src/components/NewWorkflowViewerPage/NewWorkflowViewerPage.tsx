/*
 * Copyright 2021 The Backstage Authors
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

import { Content, Header, InfoCard, Page } from '@backstage/core-components';
import { errorApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import {
  Divider,
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  FormControl,
} from '@material-ui/core';
import React, { useCallback } from 'react';
import { swfApiRef } from '../../api';
import { useForm, UseFormRegisterReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createWorkflowRouteRef, definitionsRouteRef } from '../../routes';
import {
  WorkflowFormat,
  workflow_json_sample,
  workflow_title,
  workflow_yaml_sample,
} from '@backstage/plugin-swf-common';

type FormData = {
  url: string;
};

export const NewWorkflowViewerPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const errorApi = useApi(errorApiRef);
  const swfApi = useApi(swfApiRef);
  const createWorkflowLink = useRouteRef(createWorkflowRouteRef);

  const defaultValues: FormData = {
    url: workflow_json_sample.url,
  };
  const { handleSubmit, register, formState } = useForm<FormData>({
    defaultValues,
    mode: 'onChange',
  });

  const { errors } = formState;

  const navigate = useNavigate();
  const definitionLink = useRouteRef(definitionsRouteRef);

  const handleResult = useCallback(
    async ({ url }: FormData) => {
      if (!url) {
        return;
      }
      try {
        const result = await swfApi.createWorkflowDefinition(url);

        if (!result?.definition.id) {
          errorApi.post(new Error('error importing workflow'));
        } else {
          const workflowFormat = result.uri.endsWith('.json') ? 'json' : 'yaml';
          navigate(
            definitionLink({
              swfId: result.definition.id,
              format: workflowFormat,
            }),
          );
        }
      } catch (e: any) {
        errorApi.post(new Error(e));
      }
    },
    [swfApi, errorApi, navigate, definitionLink],
  );

  const newWorkflow = useCallback(
    (format: WorkflowFormat) => {
      navigate(
        createWorkflowLink({
          format,
        }),
      );
    },
    [createWorkflowLink, navigate],
  );

  function asInputRef(renderResult: UseFormRegisterReturn) {
    const { ref, ...rest } = renderResult;
    return {
      inputRef: ref,
      ...rest,
    };
  }

  const contentItems = [
    <Grid item xs={12} xl={6} key="create-workflow">
      <InfoCard title="Create" subheader="Start authoring from scratch">
        <Button
          color="default"
          variant="outlined"
          style={{ marginTop: 8, marginRight: 8 }}
          onClick={() => newWorkflow('yaml')}
        >
          YAML
        </Button>
        <Button
          color="default"
          variant="outlined"
          style={{ marginTop: 8, marginRight: 8 }}
          onClick={() => newWorkflow('json')}
        >
          JSON
        </Button>
      </InfoCard>
    </Grid>,
    <Grid item xs={12} xl={6} key="import-workflow">
      <InfoCard
        title="Import"
        subheader="Import an existing workflow from a URL"
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <form onSubmit={handleSubmit(handleResult)}>
              <FormControl fullWidth>
                <TextField
                  {...asInputRef(
                    register('url', {
                      required: true,
                      pattern: {
                        value: /https?:\/\/.*/,
                        message: 'Must be a valid URL',
                      },
                    }),
                  )}
                  id="url"
                  label="Workflow URL"
                  margin="normal"
                  variant="outlined"
                  required
                  error={Boolean(errors.url)}
                />
              </FormControl>
              <Button
                color="primary"
                type="submit"
                variant="contained"
                style={{ marginTop: 8, marginRight: 8 }}
              >
                Import
              </Button>
            </form>
          </Grid>
          <Grid item xs={12}>
            <Divider variant="middle" />
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Typography variant="body1">or from a Sample</Typography>
              <Button
                color="default"
                variant="outlined"
                style={{ marginTop: 8, marginRight: 8 }}
                onClick={() => handleResult({ url: workflow_yaml_sample.url })}
              >
                {workflow_yaml_sample.id}
              </Button>
              <Button
                color="default"
                variant="outlined"
                style={{ marginTop: 8, marginRight: 8 }}
                onClick={() => handleResult({ url: workflow_json_sample.url })}
              >
                {workflow_json_sample.id}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </InfoCard>
    </Grid>,
  ];

  return (
    <Page themeId="home">
      <Header title={`Register a new ${workflow_title}`} />
      <Content>
        <Grid container spacing={2}>
          {isMobile ? contentItems : contentItems.reverse()}
        </Grid>
      </Content>
    </Page>
  );
};
