import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { forwardRef } from 'react';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CustomizedSnackbar(props) {


  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    props?.setOpen(false);
  };

  return (
      <Snackbar open={props?.open} autoHideDuration={4000} onClose={handleClose}  anchorOrigin={{ vertical:"top", horizontal:"right" }}>
        <Alert onClose={handleClose} severity={props?.severity} sx={{ width: '100%' }}>
          {props?.message}
        </Alert>
      </Snackbar>
  );
}