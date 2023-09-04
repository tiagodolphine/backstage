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
    fields: {
      labels: string[];
    };
  };
}

export interface IssueCommented extends BaseIssueEvent {
  issue_event_type_name: 'issue_commented';
  comment: {
    body: string;
  };
}

export interface IssueResolved extends BaseIssueEvent {
  issue_event_type_name: 'issue_resolved';
  changelog: {
    items: {
      field: string;
      fromString: string;
      toString: string;
    }[];
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

export type IssueEvent = IssueCommented | IssueUpdated | IssueResolved;

export type JiraEvent = IssueEvent;

export class JiraService {
  constructor(
    private readonly logger: Logger,
    private readonly cloudEventService: CloudEventService,
  ) {}

  public async handleEvent(jiraEvent: JiraEvent | undefined): Promise<void> {
    if (!jiraEvent) {
      this.logger.warn('Received empty event');
      return;
    }

    if (jiraEvent.issue_event_type_name === 'issue_resolved') {
      const newStatus = jiraEvent.changelog.items.find(
        item => item.field === 'status',
      )?.toString;
      const label = jiraEvent.issue.fields.labels.find(l =>
        l.includes('workflowId'),
      );
      if (!label) {
        this.logger.warn('Received event without JIRA label');
        return;
      }

      const workflowInstanceId = label.slice(label.indexOf('=') + 1);
      if (newStatus === 'Done' || newStatus === 'Resolved') {
        const response = await this.cloudEventService.send({
          event: new CloudEvent({
            type: 'jira_webhook_callback', // same defined in the workflow
            source: 'jira',
            kogitoprocrefid: workflowInstanceId, // correlation
            data: jiraEvent,
          }),
        });

        if (!response.success) {
          this.logger.error(`Failed to send cloud event: ${response.error}`);
        }
      }
    }
  }
}
