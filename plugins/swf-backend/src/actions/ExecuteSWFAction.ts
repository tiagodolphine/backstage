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
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';
import fetch from 'node-fetch';
import { DiscoveryService } from '@backstage/backend-plugin-api';

const id = 'swf:execute';

const examples = [
  {
    description: 'Execute Serverless Workflow',
    example: yaml.stringify({
      steps: [
        {
          action: id,
          id: 'swf-execute',
          name: 'Execute Serverless Workflow',
          input: {
            swfId: 'swf1',
            parameters: {},
          },
        },
      ],
    }),
  },
];
export const executeServerlessWorkflowAction = (options: {
  discovery: DiscoveryService;
}) => {
  return createTemplateAction<{ swfId: string; parameters: any }>({
    id,
    description: 'Execute a Serverless Workflow definition.',
    examples,
    schema: {
      input: {
        type: 'object',
        required: ['swfId', 'parameters'],
        properties: {
          swfId: {
            title: 'ProcessId',
            description: 'The Serverless Workflow Process Definition Id',
            type: 'string',
          },
          parameters: {
            title: 'parameters',
            description: 'Workflow input parameters',
            type: 'object',
          },
        },
      },
      output: {
        type: 'object',
        required: ['results'],
        properties: {
          results: {
            type: 'object',
          },
        },
      },
    },

    async handler(ctx) {
      const { swfId, parameters } = ctx.input;
      const swfApiUrl: string = await options.discovery.getBaseUrl('swf');
      const swfApiRequest = await fetch(`${swfApiUrl}/execute/${swfId}`, {
        method: 'POST',
        body: JSON.stringify(parameters),
        headers: { 'content-type': 'application/json' },
      });
      ctx.output('results', await swfApiRequest.json());
    },
  });
};
