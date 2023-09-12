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
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { loggerToWinstonLogger } from '@backstage/backend-common';
import { DefaultEventBroker } from '@backstage/plugin-events-backend';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';

export const orchestratorPlugin = createBackendPlugin({
  pluginId: 'swf',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        httpRouter: coreServices.httpRouter,
        urlReader: coreServices.urlReader,
        catalogApi: catalogServiceRef,
      },
      async init({
        logger,
        config,
        discovery,
        httpRouter,
        catalogApi,
        urlReader,
      }) {
        const log = loggerToWinstonLogger(logger);
        const router = await createRouter({
          eventBroker: new DefaultEventBroker(log),
          config: config,
          logger: log,
          discovery: discovery,
          catalogApi: catalogApi,
          urlReader: urlReader,
        });
        httpRouter.use(router);
      },
    });
  },
});
