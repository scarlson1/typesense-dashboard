import type { DefaultToastOptions } from 'react-hot-toast';

export const lightToastOptions: DefaultToastOptions = {
  style: {
    color: '#3E5060',
    borderRadius: '8px',
    overflowX: 'hidden',
  },
  success: {
    iconTheme: {
      primary: '#1DB45A', // '#1AA251',
      secondary: 'white',
    },
  },
  error: {
    iconTheme: {
      primary: '#EB0014',
      secondary: 'white',
    },
  },
};

export const darkToastOptions: DefaultToastOptions = {
  style: {
    color: '#B2BAC2',
    backgroundColor: '#1F262E',
    borderRadius: '8px',
    overflowX: 'hidden',
  },
  success: {
    iconTheme: {
      primary: '#3EE07F',
      secondary: 'white',
    },
  },
  error: {
    iconTheme: {
      primary: '#EB0014',
      secondary: 'white',
    },
  },
  // warn: {
  //   iconTheme: {
  //     primary: 'white'
  //   }
  // }
};
