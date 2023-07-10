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
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import {
  definitionsRouteRef,
  rootRouteRef,
  scaffolderTemplateSelectedRouteRef,
} from './routes';
import { swfApiRef, SwfClient } from './api';

export const swfPlugin = createPlugin({
  id: 'swf',
  apis: [
    createApiFactory({
      api: swfApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory({ discoveryApi }) {
        return new SwfClient({ discoveryApi });
      },
    }),
  ],
  routes: {
    root: rootRouteRef,
    definitions: definitionsRouteRef,
  },
  externalRoutes: {
    scaffolderTemplateSelectedLink: scaffolderTemplateSelectedRouteRef,
  },
});

export const SWFInstancesViewerPage = swfPlugin.provide(
  createRoutableExtension({
    name: 'SWFInstancesViewerPage',
    component: () =>
      import('./components/SWFInstancesViewerPage').then(
        m => m.SWFInstancesViewerPage,
      ),
    mountPoint: rootRouteRef,
  }),
);

export const SWFPage = swfPlugin.provide(
  createRoutableExtension({
    name: 'SWFPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);