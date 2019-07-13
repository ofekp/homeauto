import { createMuiTheme, makeStyles } from '@material-ui/core/styles'; // v1.x
import blue from '@material-ui/core/colors/blue';

export const appTheme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: {
      main: '#E33E7F'
    }
  },
  slider: { trackSize : 50, handleSize:50 },
});