import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    options: {
      storySort: {
        order: ['Nirog'],
        method: 'alphabetical',
      },
    },
  },
};

export default preview;
