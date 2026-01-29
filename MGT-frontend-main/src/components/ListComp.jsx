import { Box, Grid, Typography } from "@mui/material";

import { tokens } from "../theme";
import { useTheme } from "@mui/material";

function ListComp(props) {
  const theme = useTheme();
  const colors = tokens(theme?.palette?.mode);
  const value = props?.value;
  if (value)
    return (
      <Grid item xs={12}>
        <Box display="flex" flexWrap={"wrap"} gap={1}>
          <Typography
            color={colors?.greenAccent[600]}
            variant="h3"
            gutterBottom
          >
            {props?.title}:
          </Typography>
          <Typography variant="h3">
            {" "}
            {props?.edit && props?.value != props?.editedValue ? (
              <del>{props?.editedValue}</del>
            ) : (
              props?.value
            )}
          </Typography>
          {props?.edit && props?.value != props?.editedValue && (
            <Typography variant="h3">{props?.value}</Typography>
          )}
        </Box>
      </Grid>
    );
  else return <></>;
}

export default ListComp;
