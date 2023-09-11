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

import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import {
  TitleFieldProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import SubdirectoryArrowRightIcon from '@material-ui/icons/SubdirectoryArrowRight';

export const TitleFieldTemplate = <
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(
  props: TitleFieldProps<T, S, F>,
) => {
  const { id, title } = props;

  return (
    <Grid
      container
      spacing={1}
      direction="row"
      alignItems="center"
      style={{ marginTop: '8px' }}
    >
      <Grid item>
        <SubdirectoryArrowRightIcon />
      </Grid>
      <Grid item>
        <Typography
          id={id}
          variant="body1"
          style={{ fontWeight: 500, fontSize: '16px' }}
        >
          {title}
        </Typography>
      </Grid>
    </Grid>
  );
};
