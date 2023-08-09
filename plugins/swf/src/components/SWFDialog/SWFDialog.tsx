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
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  makeStyles,
  IconButton,
  Typography,
} from '@material-ui/core';
import { SWFEditor } from '../SWFEditor';
import { EditorViewKind } from '../SWFEditor/SWFEditor';
import CloseIcon from '@material-ui/icons/Close';

type SWFDialogProps = {
  swfId: string;
  title: string;
  open: boolean;
  close: () => void;
};

const useStyles = makeStyles(_theme => ({
  editor: {
    height: '600px',
    marginBottom: 20,
  },
  closeBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
}));

export const SWFDialog = (props: SWFDialogProps): JSX.Element | null => {
  const { swfId, title, open, close } = props;
  const classes = useStyles();

  return (
    <Dialog fullWidth maxWidth="lg" onClose={_ => close()} open={open}>
      <DialogTitle>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <IconButton
            className={classes.closeBtn}
            aria-label="close"
            onClick={close}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box className={classes.editor}>
          <SWFEditor
            kind={EditorViewKind.EXTENDED_DIAGRAM_VIEWER}
            swfId={swfId}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};
