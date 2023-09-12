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
import {
  createBuiltinActions,
  TemplateActionRegistry,
} from '@backstage/plugin-scaffolder-backend';
import { ScmIntegrations } from '@backstage/integration';
import { Config } from '@backstage/config';
import { CatalogApi } from '@backstage/catalog-client';
import { UrlReader } from '@backstage/backend-common';
import {
  ActionContext,
  TemplateAction,
} from '@backstage/plugin-scaffolder-node';
import { PassThrough } from 'stream';
import { fs } from 'fs-extra';
import path from 'path';
import { JsonObject, JsonValue } from '@backstage/types';
import { randomUUID } from 'crypto';
import os from 'os';
import { assertError } from '@backstage/errors';

export interface ActionExecutionContext {
  actionId: string;
  instanceId: string | undefined;
  input: JsonObject;
}

export class ScaffolderService {
  private actionRegistry: TemplateActionRegistry;
  private streamLogger = new PassThrough();

  constructor(
    private readonly logger: Logger,
    private readonly config: Config,
    private readonly catalogApi: CatalogApi,
    private readonly urlReader: UrlReader,
  ) {
    this.actionRegistry = new TemplateActionRegistry();
  }

  public loadActions(): void {
    const actions = [
      ...createBuiltinActions({
        integrations: ScmIntegrations.fromConfig(this.config),
        catalogClient: this.catalogApi,
        reader: this.urlReader,
        config: this.config,
      }),
    ];
    actions.forEach(a => this.actionRegistry.register(a));
  }

  public getAction(id: string): TemplateAction {
    return this.actionRegistry.get(id);
  }

  public async executeAction(
    actionExecutionContext: ActionExecutionContext,
  ): Promise<JsonValue> {
    if (this.actionRegistry.list().length === 0) {
      this.loadActions();
    }

    const action: TemplateAction = this.getAction(
      actionExecutionContext.actionId,
    );
    const tmpDirs: string[] = new Array<string>();
    const stepOutput: { [outputName: string]: JsonValue } = {};
    const workingDirectory: string = await this.getWorkingDirectory(
      this.config,
      this.logger,
    );
    const workspacePath: string = path.join(
      workingDirectory,
      actionExecutionContext.instanceId ?? randomUUID(),
    );
    const mockContext: ActionContext<JsonObject> = {
      input: actionExecutionContext.input,
      workspacePath: workspacePath,
      logger: this.logger,
      logStream: this.streamLogger,
      createTemporaryDirectory: async () => {
        const tmpDir = await fs.mkdtemp(`${workspacePath}_step-${0}-`);
        tmpDirs.push(tmpDir);
        return tmpDir;
      },
      output(name: string, value: JsonValue) {
        stepOutput[name] = value;
      },
    };
    await action.handler(mockContext);

    // TODO Not sure if we need these "long lived" for the duration of the whole Workflow
    // Remove all temporary directories that were created when executing the action
    // for (const tmpDir of tmpDirs) {
    //   await fs.remove(tmpDir);
    // }
    return stepOutput;
  }

  async getWorkingDirectory(config: Config, logger: Logger): Promise<string> {
    if (!config.has('backend.workingDirectory')) {
      return os.tmpdir();
    }

    const workingDirectory = config.getString('backend.workingDirectory');
    try {
      // Check if working directory exists and is writable
      await fs.access(workingDirectory, fs.constants.F_OK | fs.constants.W_OK);
      logger.info(`using working directory: ${workingDirectory}`);
    } catch (err) {
      assertError(err);
      logger.error(
        `working directory ${workingDirectory} ${
          err.code === 'ENOENT' ? 'does not exist' : 'is not writable'
        }`,
      );
      throw err;
    }
    return workingDirectory;
  }
}
