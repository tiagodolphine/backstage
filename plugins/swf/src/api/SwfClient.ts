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
import { ResponseError } from '@backstage/errors';
import { SwfApi } from './api';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { SwfItem, SwfListResult } from '@backstage/plugin-swf-common';

export interface SwfClientOptions {
  discoveryApi: DiscoveryApi;
}
export class SwfClient implements SwfApi {
  private readonly discoveryApi: DiscoveryApi;
  constructor(options: SwfClientOptions) {
    this.discoveryApi = options.discoveryApi;
  }

  async getSwf(swfId: string): Promise<SwfItem> {
    const baseUrl = await this.discoveryApi.getBaseUrl('swf');
    const res = await fetch(`${baseUrl}/items/${swfId}`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    const data: SwfItem = await res.json();
    return data;
  }
  async listSwfs(): Promise<SwfListResult> {
    const baseUrl = await this.discoveryApi.getBaseUrl('swf');
    const res = await fetch(`${baseUrl}/items`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    const data: SwfListResult = await res.json();
    return data;
  }

  async getInstances(): Promise<any> {
    const baseUrl = await this.discoveryApi.getBaseUrl('swf');
    const res = await fetch(`${baseUrl}/instances`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    const data: string = await res.json();
    return data;
  }

  async getInstance(instanceId: string): Promise<any> {
    const baseUrl = await this.discoveryApi.getBaseUrl('swf');
    const res = await fetch(`${baseUrl}/instances/${instanceId}`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    const data: string = await res.json();
    return data;
  }
}