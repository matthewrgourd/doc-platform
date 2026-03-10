import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  gettingStartedSidebar: [
    {
      type: 'doc',
      id: 'getting-started/index',
      label: 'Overview',
    },
    {
      type: 'doc',
      id: 'getting-started/quickstart',
      label: 'Quickstart',
    },
    {
      type: 'doc',
      id: 'getting-started/authentication',
      label: 'Authentication',
    },
    {
      type: 'doc',
      id: 'getting-started/error-handling',
      label: 'Error Handling',
    },
  ],

  paymentsSidebar: [
    {
      type: 'doc',
      id: 'payments/index',
      label: 'Overview',
    },
    {
      type: 'doc',
      id: 'payments/accept-a-payment',
      label: 'Accept a Payment',
    },
    {
      type: 'doc',
      id: 'payments/refunds',
      label: 'Refunds',
    },
    {
      type: 'doc',
      id: 'payments/webhooks',
      label: 'Webhooks',
    },
  ],

  connectSidebar: [
    {
      type: 'doc',
      id: 'connect/index',
      label: 'Overview',
    },
    {
      type: 'doc',
      id: 'connect/onboarding',
      label: 'Merchant Onboarding',
    },
    {
      type: 'doc',
      id: 'connect/payouts',
      label: 'Payouts',
    },
  ],
};

export default sidebars;
