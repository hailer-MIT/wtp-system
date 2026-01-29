import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import ProgressCircle from "./ProgressCircle";

const StatBox = ({ title, subtitle, icon, progress, increase }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      sx={{
        width: "100%",
        px: 3,
        py: 2.5,
        borderRadius: "18px",
        bgcolor: `linear-gradient(135deg, ${colors.primary[400]}, ${colors.blueAccent[800]})`,
        boxShadow: "0 6px 32px rgba(30, 136, 229, 0.23)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px) scale(1.02)',
          boxShadow: '0 12px 36px rgba(30, 136, 229, 0.32)',
        },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Box display="flex" alignItems="center" gap={1}>
            {icon}
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ color: colors.grey[100] }}
            >
              {title}
            </Typography>
          </Box>
          <Typography
            variant="subtitle2"
            sx={{ color: colors.grey[300], opacity: 0.9 }}
          >
            {subtitle}
          </Typography>
        </Box>
        <Box>
          <ProgressCircle progress={progress} />
        </Box>
      </Box>
      <Box display="flex" justifyContent="flex-end" mt={0.5}>
        <Typography
          variant="body2"
          fontStyle="italic"
          sx={{ color: colors.greenAccent[400] }}
        >
          {increase}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox;
