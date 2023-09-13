/*
 * Copyright 2022 The Backstage Authors
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
  TemplateCard,
  TemplateCardProps,
} from '@backstage/plugin-scaffolder-react/alpha';
import { TemplateEntityV1beta3 } from '@backstage/plugin-scaffolder-common';
import { useNavigate } from 'react-router-dom';
import { useRouteRef } from '@backstage/core-plugin-api';
import { executeWorkflowRouteRef } from '../../routes';
import { workflow_type } from '@backstage/plugin-swf-common';

export const NextScaffolderTemplateCard = (props: TemplateCardProps) => {
  const { onSelected } = props;
  const navigate = useNavigate();
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);

  const onSelectedExtended = useCallback(
    (template: TemplateEntityV1beta3) => {
      const isWorkflow = template.metadata.tags?.includes(workflow_type);

      if (!isWorkflow) {
        onSelected?.(template);
        return;
      }

      navigate(executeWorkflowLink({ swfId: template.metadata.name }));
    },
    [executeWorkflowLink, navigate, onSelected],
  );

  return <TemplateCard {...props} onSelected={onSelectedExtended} />;
};
