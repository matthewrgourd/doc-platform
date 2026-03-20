import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tflSidebar: [
    {
      type: 'category',
      label: 'Getting started',
      items: [
        {type: 'doc', id: 'getting-started/index', label: 'Overview'},
        {type: 'doc', id: 'getting-started/quickstart', label: 'Quickstart'},
        {type: 'doc', id: 'getting-started/bike-point', label: 'Bike points'},
        {type: 'doc', id: 'getting-started/authentication', label: 'Authentication'},
        {type: 'doc', id: 'getting-started/error-handling', label: 'Error handling'},
      ],
    },
    {
      type: 'category',
      label: 'Lines',
      items: [
        {type: 'doc', id: 'lines/index', label: 'Overview'},
        {type: 'doc', id: 'lines/status', label: 'Line status'},
        {type: 'doc', id: 'lines/routes', label: 'Line routes'},
      ],
    },
    {
      type: 'category',
      label: 'Stop points',
      items: [
        {type: 'doc', id: 'stoppoints/index', label: 'Overview'},
        {type: 'doc', id: 'stoppoints/search', label: 'Search stops'},
        {type: 'doc', id: 'stoppoints/arrivals', label: 'Arrivals'},
      ],
    },
    {
      type: 'category',
      label: 'Journey',
      items: [
        {type: 'doc', id: 'journey/index', label: 'Overview'},
        {type: 'doc', id: 'journey/plan', label: 'Plan a journey'},
      ],
    },
    {type: 'link', label: 'API playground', href: '/tfl/api-playground'},
  ],
};

export default sidebars;
