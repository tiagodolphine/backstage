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

import { InfoCard, Table } from '@backstage/core-components';
import { swfApiRef } from '../../api';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { swfInstanceRouteRef } from '../../routes';
import { ProcessInstance } from '@backstage/plugin-swf-common';
import { Button, Typography } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

interface ProcessInstancesTableProps {
  selectedInstance: ProcessInstance | undefined;
  setSelectedInstance: (instance: ProcessInstance | undefined) => void;
}

type Row = {
  pid: string;
  name: string;
  state: string;
};

const REFRESH_COUNTDOWN_INITIAL_VALUE_IN_SECONDS = 30;

export const ProcessInstancesTable = (props: ProcessInstancesTableProps) => {
  const swfApi = useApi(swfApiRef);
  const { instanceId } = useRouteRefParams(swfInstanceRouteRef);
  const [data, setData] = useState<Row[]>([]);
  const { selectedInstance, setSelectedInstance } = props;
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const [refreshCountdownInSeconds, setRefreshCountdownInSeconds] = useState(
    REFRESH_COUNTDOWN_INITIAL_VALUE_IN_SECONDS,
  );
  const instanceLink = useRouteRef(swfInstanceRouteRef);
  const navigate = useNavigate();

  const column1 = {
    title: 'Id',
    field: 'pid',
  };

  const column2 = {
    title: 'Name',
    field: 'name',
  };

  const column3 = {
    title: 'State',
    field: 'state',
  };

  const loadInstances = useCallback(async () => {
    try {
      setIsLoadingInstances(true);
      const instances = await swfApi.getInstances();
      const rows: Row[] = instances
        .map(pi => {
          return {
            pid: pi.id,
            name: pi.processId,
            state: pi.state,
          };
        })
        .reverse();
      setData(rows);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setIsLoadingInstances(false);
    }
  }, [swfApi]);

  useEffect(() => {
    loadInstances();
  }, [loadInstances]);

  const loadInstance = useCallback(
    (pid: string | undefined) => {
      if (pid) {
        swfApi.getInstance(pid).then(value => {
          setSelectedInstance(value);
          navigate(instanceLink({ instanceId: pid }));
        });
      }
    },
    [swfApi, navigate, instanceLink, setSelectedInstance],
  );

  useEffect(() => {
    const selectedRowData = data.find(d => d.pid === instanceId);
    if (selectedRowData) {
      loadInstance(selectedRowData.pid);
    }
  }, [loadInstance, data, instanceId]);

  useEffect(() => {
    if (!selectedInstance || !data.length) {
      return undefined;
    }

    const updatedItem = data.find(pi => pi.pid === selectedInstance.id);
    if (!updatedItem) {
      return undefined;
    }

    if (selectedInstance.state !== updatedItem.state) {
      setSelectedInstance(undefined);
      loadInstance(updatedItem.pid);
    }

    return () => {
      setRefreshCountdownInSeconds(REFRESH_COUNTDOWN_INITIAL_VALUE_IN_SECONDS);
    };
  }, [data, loadInstance, selectedInstance, setSelectedInstance]);

  useEffect(() => {
    if (isLoadingInstances) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setRefreshCountdownInSeconds(prev => prev - 1);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isLoadingInstances]);

  useEffect(() => {
    if (refreshCountdownInSeconds > 0) {
      return;
    }

    loadInstances();
  }, [loadInstances, refreshCountdownInSeconds]);

  return (
    <InfoCard
      title="Instances"
      action={
        <Button
          style={{ marginTop: 8, marginRight: 8 }}
          disabled={isLoadingInstances}
          onClick={() => loadInstances()}
        >
          {isLoadingInstances ? 'Refreshing ...' : 'Refresh'}
        </Button>
      }
    >
      <div style={{ height: '500px', padding: '10px' }}>
        <Table<Row>
          data={data}
          columns={[column1, column2, column3]}
          isLoading={isLoadingInstances}
          onRowClick={(_, rowData) => {
            if (rowData && rowData.pid !== selectedInstance?.id) {
              loadInstance(rowData.pid);
            }
          }}
          options={{
            padding: 'dense',
            paging: true,
            pageSize: 8,
            rowStyle: (rowData: Row) => {
              return rowData.pid === selectedInstance?.id
                ? { backgroundColor: '#a266e5' }
                : {};
            },
          }}
        />
        <Typography
          variant="caption"
          style={{ marginTop: '6px', float: 'right' }}
        >
          <i>Auto refreshing in {refreshCountdownInSeconds} seconds</i>
        </Typography>
      </div>
    </InfoCard>
  );
};
