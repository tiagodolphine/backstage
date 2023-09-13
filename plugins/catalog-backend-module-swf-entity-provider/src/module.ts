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

import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { ServerlessWorkflowEntityProvider } from './ServerlessWorkflowEntityProvider';
import { loggerToWinstonLogger } from '@backstage/backend-common';
import { DefaultEventBroker } from '@backstage/plugin-events-backend';

export const swfModuleEntityProvider = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'swf-entity-provider',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        scheduler: coreServices.scheduler,
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ logger, config, discovery, scheduler, catalog }) {
        const winstonLogger = loggerToWinstonLogger(logger);
        const eventBroker = new DefaultEventBroker(winstonLogger);
        const provider = await ServerlessWorkflowEntityProvider.fromConfig({
          config,
          discovery,
          logger: winstonLogger,
          scheduler,
        });
        eventBroker.subscribe(provider);
        catalog.addEntityProvider(provider);
      },
    });
  },
});
