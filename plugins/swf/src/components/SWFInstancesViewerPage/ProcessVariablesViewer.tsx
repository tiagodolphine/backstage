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
import React, { useMemo } from 'react';
import ReactJson from 'react-json-view';

import { InfoCard } from '@backstage/core-components';
import { useTheme } from '@material-ui/core';
import { Paragraph } from '../Paragraph/Paragraph';

interface ProcessVariablesViewerProps {
  variables: Record<string, unknown> | string | undefined;
}

export const ProcessVariablesViewer = (props: ProcessVariablesViewerProps) => {
  const { variables } = props;
  const theme = useTheme();

  const jsonSource = useMemo(() => {
    if (!variables) {
      return undefined;
    }
    if (typeof variables === 'string') {
      return JSON.parse(variables);
    }
    return variables;
  }, [variables]);

  return (
    <InfoCard title="Variables">
      {variables === undefined && <Paragraph>No instance selected</Paragraph>}
      <div>
        {variables && (
          <ReactJson
            src={jsonSource}
            name={false}
            theme={theme.palette.type === 'dark' ? 'monokai' : 'rjv-default'}
          />
        )}
      </div>
    </InfoCard>
  );
};
