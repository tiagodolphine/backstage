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

import { httpTransport, emitterFor, CloudEvent } from 'cloudevents';
import { Logger } from 'winston';

export type CloudEventResponse =
  | { success: true }
  | { success: false; error: string };

export class CloudEventService {
  constructor(
    private readonly logger: Logger,
    private readonly baseUrl: string,
  ) {}

  public async send<T>(args: {
    event: CloudEvent<T>;
    endpoint?: string;
  }): Promise<CloudEventResponse> {
    try {
      const targetUrl = args.endpoint
        ? `${this.baseUrl}/${args.endpoint}`
        : this.baseUrl;
      this.logger.info(
        `Sending CloudEvent to ${targetUrl} with data ${JSON.stringify(
          args.event,
        )}`,
      );
      const emit = emitterFor(httpTransport(targetUrl));
      await emit(args.event);
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      return {
        success: false,
        error: e.message,
      };
    }
  }
}