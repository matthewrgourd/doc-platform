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
      label: 'Error handling',
    },
  ],

  petsSidebar: [
    {
      type: 'doc',
      id: 'pets/index',
      label: 'Overview',
    },
    {
      type: 'doc',
      id: 'pets/add-pet',
      label: 'Add a pet',
    },
    {
      type: 'doc',
      id: 'pets/find-pets',
      label: 'Find pets',
    },
    {
      type: 'doc',
      id: 'pets/update-pet',
      label: 'Update a pet',
    },
    {
      type: 'doc',
      id: 'pets/delete-pet',
      label: 'Delete a pet',
    },
    {
      type: 'doc',
      id: 'pets/upload-image',
      label: 'Upload an image',
    },
  ],

  storeSidebar: [
    {
      type: 'doc',
      id: 'store/index',
      label: 'Overview',
    },
    {
      type: 'doc',
      id: 'store/place-order',
      label: 'Place an order',
    },
    {
      type: 'doc',
      id: 'store/get-order',
      label: 'Get order by ID',
    },
    {
      type: 'doc',
      id: 'store/cancel-order',
      label: 'Cancel an order',
    },
    {
      type: 'doc',
      id: 'store/inventory',
      label: 'Inventory',
    },
  ],

  usersSidebar: [
    {
      type: 'doc',
      id: 'users/index',
      label: 'Overview',
    },
    {
      type: 'doc',
      id: 'users/create-user',
      label: 'Create a user',
    },
    {
      type: 'doc',
      id: 'users/login',
      label: 'Login and logout',
    },
    {
      type: 'doc',
      id: 'users/manage-user',
      label: 'Manage users',
    },
  ],
};

export default sidebars;
