import { createTheme } from '@rneui/themed';

export const tuiChatTheme = createTheme({
  lightColors: {
    primary: '#DCEAFD',
    secondary: '#ECECEC',
    grey3: '#444444',
    grey4: '#999999',
    grey5: '#B2B2B2',
    greyOutline: '#DCDCDC',
  },
  darkColors: {
    primary: '#DCEAFD',
    secondary: '#ECECEC',
    grey4: '#666666',
    grey5: '#DDDDDD',
    greyOutline: '#DCDCDC',
  },
  components: {
    Text: {
      h2Style: {
        fontSize: 16,
        fontWeight: '600',
      },
      h3Style: {
        fontSize: 14,
        fontWeight: '500',
      },
      h4Style: {
        fontSize: 12,
        fontWeight: '400',
      },
    },
  },
});
