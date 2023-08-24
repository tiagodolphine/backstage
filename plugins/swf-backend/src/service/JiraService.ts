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
import { CloudEventService } from './CloudEventService';
import { CloudEvent } from 'cloudevents';

export interface BaseIssueEvent {
  webhookEvent: 'jira:issue_updated';
  issue: {
    id: string;
    key: string;
  };
}

export interface IssueCommented extends BaseIssueEvent {
  issue_event_type_name: 'issue_commented';
  comment: {
    body: string;
  };
}

export interface IssueUpdated extends BaseIssueEvent {
  issue_event_type_name: 'issue_generic';
  changelog: {
    items: {
      field: string;
      fromString: string;
      toString: string;
    }[];
  };
}

export type IssueEvent = IssueCommented | IssueUpdated;

export type JiraEvent = IssueEvent;

export class JiraService {
  constructor(
    private readonly logger: Logger,
    private readonly cloudEventService: CloudEventService,
  ) {}

  public async handleEvent(event: JiraEvent | undefined): Promise<void> {
    if (!event) {
      this.logger.warn('Received empty event');
      return;
    }

    if (event.issue_event_type_name === 'issue_generic') {
      const newStatus = event.changelog.items.find(
        item => item.field === 'status',
      )?.toString;
      if (newStatus === 'Done') {
        // TODO: send cloud event
        const response = await this.cloudEventService.send({
          event: new CloudEvent({
            type: 'my.cloud.event.type',
            source: 'my.cloud.event.source',
            data: {
              asdf: 1,
            },
          }),
        });

        if (!response.success) {
          this.logger.error(`Failed to send cloud event: ${response.error}`);
        }
      }
    }
  }
}
