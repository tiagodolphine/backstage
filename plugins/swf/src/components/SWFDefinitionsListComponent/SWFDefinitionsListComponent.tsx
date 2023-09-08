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
import React, { useCallback } from 'react';
import {
  Table,
  TableColumn,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { swfApiRef } from '../../api';
import {
  SwfItem,
  extractWorkflowFormatFromUri,
} from '@backstage/plugin-swf-common';
import DeleteForever from '@material-ui/icons/DeleteForever';
import Pageview from '@material-ui/icons/Pageview';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Edit from '@material-ui/icons/Edit';
import {
  definitionsRouteRef,
  editWorkflowRouteRef,
  executeWorkflowRouteRef,
} from '../../routes';
import { useNavigate } from 'react-router-dom';

type SwfItemsTableProps = {
  items: SwfItem[];
};

export const SwfItemsTable = ({ items }: SwfItemsTableProps) => {
  const swfApi = useApi(swfApiRef);

  const navigate = useNavigate();
  const definitionLink = useRouteRef(definitionsRouteRef);
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);
  const editLink = useRouteRef(editWorkflowRouteRef);

  interface Row {
    id: string;
    name: string;
    format: string;
  }

  const columns: TableColumn[] = [{ title: 'Name', field: 'name' }];
  const data: Row[] = items.map(item => {
    return {
      id: item.definition.id,
      name: item.definition.name ?? '',
      format: extractWorkflowFormatFromUri(item.uri),
    };
  });

  const doView = useCallback(
    (rowData: Row) => {
      navigate(definitionLink({ swfId: rowData.id, format: rowData.format }));
    },
    [definitionLink, navigate],
  );

  const doExecute = useCallback(
    (rowData: Row) => {
      navigate(executeWorkflowLink({ swfId: rowData.id }));
    },
    [executeWorkflowLink, navigate],
  );

  const doEdit = useCallback(
    (rowData: Row) => {
      navigate(editLink({ swfId: `${rowData.id}`, format: rowData.format }));
    },
    [editLink, navigate],
  );

  const doDelete = useCallback(
    (rowData: Row) => {
      // Lazy use of window.confirm vs writing a popup.
      if (
        // eslint-disable-next-line no-alert
        window.confirm(
          `Please confirm you want to delete '${rowData.id}' permanently.`,
        )
      ) {
        swfApi.deleteWorkflowDefinition(rowData.id);
      }
    },
    [swfApi],
  );

  return (
    <Table
      title=""
      options={{ search: true, paging: false, actionsColumnIndex: 1 }}
      columns={columns}
      data={data}
      actions={[
        {
          icon: () => <PlayArrow />,
          tooltip: 'Execute',
          onClick: (_, rowData) => doExecute(rowData as Row),
        },
        {
          icon: () => <Pageview />,
          tooltip: 'View',
          onClick: (_, rowData) => doView(rowData as Row),
        },
        {
          icon: () => <Edit />,
          tooltip: 'Edit',
          onClick: (_, rowData) => doEdit(rowData as Row),
        },
        {
          icon: () => <DeleteForever />,
          tooltip: 'Delete',
          onClick: (_, rowData) => doDelete(rowData as Row),
        },
      ]}
    />
  );
};

export const SWFDefinitionsListComponent = () => {
  const swfApi = useApi(swfApiRef);
  const { value, error, loading } = useAsync(async (): Promise<SwfItem[]> => {
    const data = await swfApi.listSwfs();
    return data.items;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <SwfItemsTable items={value ?? []} />;
};
