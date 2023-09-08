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

import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'swf',
});

export const definitionsRouteRef = createSubRouteRef({
  id: 'swf/items',
  parent: rootRouteRef,
  path: '/items/:format/:swfId',
});

export const swfInstancesRouteRef = createSubRouteRef({
  id: 'swf/instance',
  parent: rootRouteRef,
  path: '/instances',
});

export const swfInstanceRouteRef = createSubRouteRef({
  id: 'swf/instance',
  parent: rootRouteRef,
  path: '/instances/:instanceId',
});

export const newWorkflowRef = createSubRouteRef({
  id: 'swf/workflows/new',
  parent: rootRouteRef,
  path: '/workflows/new',
});

export const createWorkflowRouteRef = createSubRouteRef({
  id: 'swf/workflows/create',
  parent: rootRouteRef,
  path: '/workflows/create/:format',
});

export const editWorkflowRouteRef = createSubRouteRef({
  id: 'swf/workflows/edit',
  parent: rootRouteRef,
  path: '/workflows/edit/:format/:swfId',
});

export const executeWorkflowRouteRef = createSubRouteRef({
  id: 'swf/workflows/execute',
  parent: rootRouteRef,
  path: '/workflows/execute/:swfId',
});
