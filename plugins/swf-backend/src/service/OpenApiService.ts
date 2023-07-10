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

import { Logger } from 'winston';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import fs from 'fs-extra';
import { resolvePackagePath } from '@backstage/backend-common';

export class OpenApiService {
  logger: Logger;
  discovery: DiscoveryApi;

  constructor(logger: Logger, discovery: DiscoveryApi) {
    this.logger = logger;
    this.discovery = discovery;
  }

  private async fetchScaffolderActions(): Promise<any> {
    const scaffolderUrl = await this.discovery.getBaseUrl('scaffolder');
    return fetch(`${scaffolderUrl}/v2/actions`).then(res => {
      return res.json();
    });
  }

  private async openApiTemplate(): Promise<any> {
    const path = resolvePackagePath(
      `@backstage/plugin-swf-backend`,
      `src/service/openapi-template.json`,
    );
    return fs.readFile(path).then(buffer => {
      return JSON.parse(buffer.toString('utf8'));
    });
  }

  async generateOpenApi(): Promise<any> {
    const template = await this.openApiTemplate();
    return this.fetchScaffolderActions()
      .then(async actions => {
        template.paths = await this.mapPaths(actions);
        return actions;
      })
      .then(this.mapSchemas)
      .then(schemas => {
        template.components.schemas = schemas;
        return template;
      })
      .catch(err => {
        this.logger.error(err);
      });
  }

  private async mapPaths(actions: any): Promise<any> {
    const paths = {};
    for (const action of actions) {
      const actionId: string = action.id;
      const description = action.description;
      const schemaName = actionId.replaceAll(':', '');

      const path = `/actions/${actionId}`;
      paths[path] = {
        post: {
          operationId: actionId,
          description: description,
          parameters: [],
          requestBody: {
            description: `Input parameters for the action ${actionId} in BS`,
            required: true,
            content: {
              'application/json;charset=utf-8': {
                schema: {
                  $ref: `#/components/schemas/${schemaName}`,
                },
              },
            },
          },
          responses: {
            default: {
              description: `Action ${actionId} response`,
              content: {
                'application/json;charset=utf-8': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
          },
        },
      };
    }
    return paths;
  }

  private async mapSchemas(actions: any): Promise<any> {
    const schemas = {};
    for (const action of actions) {
      const actionId: string = action.id;
      const schema = action.schema;
      const input = schema.input;
      const schemaName = actionId.replaceAll(':', '');

      delete input.$schema;

      // dfs to find and handle invalid properties
      const dfs = function (object: any) {
        if (
          !object ||
          !(Object.prototype.toString.call(object) === '[object Object]')
        ) {
          return;
        }
        Object.entries(object).forEach(([k, v]) => {
          const invalidOneOfProp = k === 'oneOf' && !object[k].pop().type;
          const invalidConstProperty = k === 'const' && v === '*';
          const invalidTypeArray =
            k === 'type' && v === 'array' && !object.items;
          if (invalidOneOfProp || invalidConstProperty) {
            delete object[k];
          } else if (invalidTypeArray) {
            // invalid array type that does not contain items property fallback to string
            object[k] = 'string';
          } else {
            dfs(object[k]);
          }
        });
      };
      dfs(input);

      if (input.properties) {
        Object.keys(input.properties).forEach(key => {
          const prop = input.properties[key];
          if (prop && Array.isArray(prop.type)) {
            // type: [string, boolean] is invalid
            prop.type = prop.type.pop();
          }
        });
      }

      schemas[schemaName] = input;
    }
    return schemas;
  }
}