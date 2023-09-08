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

import React, { useCallback, useEffect, useState } from 'react';
import { BaseWorkflowPage } from '../BaseWorkflowPage/BaseWorkflowPage';
import { executeWorkflowRouteRef, swfInstanceRouteRef } from '../../routes';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { withTheme } from '@rjsf/core-v5';
import { Button, Typography } from '@material-ui/core';
import { swfApiRef } from '../../api';
import { JSONSchema7 } from 'json-schema';
import { ContentHeader, InfoCard, Progress } from '@backstage/core-components';
import validator from '@rjsf/validator-ajv8';
import {
  WorkflowDataInputSchemaResponse,
  workflow_title,
} from '@backstage/plugin-swf-common';
import { SWFDialog } from '../SWFDialog';
import { EditorViewKind } from '../SWFEditor';
import { JsonValue } from '@backstage/types';
import { useNavigate } from 'react-router-dom';
import { WorkflowSupportButton } from '../WorkflowSupportButton/WorkflowSupportButton';

const WrappedForm = withTheme(require('@rjsf/material-ui-v5').Theme);

interface ExecuteWorkflowPageProps {
  initialState?: Record<string, JsonValue>;
}

export const ExecuteWorkflowPage = (props: ExecuteWorkflowPageProps) => {
  const swfApi = useApi(swfApiRef);
  const { swfId } = useRouteRefParams(executeWorkflowRouteRef);
  const [loading, setLoading] = useState(false);
  const [schemaResponse, setSchemaResponse] =
    useState<WorkflowDataInputSchemaResponse>();
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState<boolean>(false);
  const [formState, setFormState] = useState(props.initialState);

  const navigate = useNavigate();
  const instanceLink = useRouteRef(swfInstanceRouteRef);

  useEffect(() => {
    setLoading(true);
    swfApi
      .getWorkflowDataInputSchema(swfId)
      .then(response => {
        setSchemaResponse(response);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [swfApi, swfId]);

  const onExecute = useCallback(async () => {
    if (!formState) {
      return;
    }

    const parameters: Record<string, JsonValue> = {};
    for (const key in formState) {
      if (formState.hasOwnProperty(key)) {
        const property = formState[key];
        Object.assign(parameters, property);
      }
    }

    setLoading(true);
    const response = await swfApi.executeWorkflow({ swfId, parameters });
    setLoading(false);

    navigate(instanceLink({ instanceId: response.id }));
  }, [formState, instanceLink, navigate, swfApi, swfId]);

  const onFormChanged = useCallback(
    e => setFormState(current => ({ ...current, ...e.formData })),
    [setFormState],
  );

  return (
    <BaseWorkflowPage>
      <ContentHeader title="Execute">
        <WorkflowSupportButton />
      </ContentHeader>
      {loading && <Progress />}
      {schemaResponse && (
        <InfoCard
          title={schemaResponse.swfItem.definition.name ?? swfId}
          subheader={schemaResponse.swfItem.definition.description}
          action={
            <>
              <Button
                variant="outlined"
                color="secondary"
                style={{ marginTop: 8, marginRight: 8 }}
                onClick={_ => setWorkflowDialogOpen(true)}
              >
                View {workflow_title}
              </Button>
              <SWFDialog
                kind={EditorViewKind.EXTENDED_DIAGRAM_VIEWER}
                swfId={swfId}
                title={
                  schemaResponse.swfItem.definition.name ??
                  schemaResponse.swfItem.definition.id
                }
                open={workflowDialogOpen}
                close={() => setWorkflowDialogOpen(false)}
              />
            </>
          }
        >
          {schemaResponse ? (
            <WrappedForm
              schema={schemaResponse.schema as JSONSchema7}
              validator={validator}
              showErrorList={false}
              onSubmit={onExecute}
              onChange={onFormChanged}
              formData={formState}
              formContext={{ formData: formState }}
            >
              <Button variant="contained" color="primary" type="submit">
                Execute
              </Button>
            </WrappedForm>
          ) : (
            <Typography>No input schema</Typography>
          )}
        </InfoCard>
      )}
    </BaseWorkflowPage>
  );
};
