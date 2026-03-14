import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  gettingStartedSidebar: [
    {type: 'doc', id: 'getting-started/index', label: 'Overview'},
    {type: 'doc', id: 'getting-started/quickstart', label: 'Quickstart'},
    {type: 'doc', id: 'getting-started/authentication', label: 'Authentication'},
    {type: 'doc', id: 'getting-started/error-handling', label: 'Error handling'},
  ],
  linesSidebar: [
    {type: 'doc', id: 'lines/index', label: 'Overview'},
    {type: 'doc', id: 'lines/status', label: 'Line status'},
    {type: 'doc', id: 'lines/routes', label: 'Line routes'},
  ],
  stoppointsSidebar: [
    {type: 'doc', id: 'stoppoints/index', label: 'Overview'},
    {type: 'doc', id: 'stoppoints/search', label: 'Search stops'},
    {type: 'doc', id: 'stoppoints/arrivals', label: 'Arrivals'},
  ],
  journeySidebar: [
    {type: 'doc', id: 'journey/index', label: 'Overview'},
    {type: 'doc', id: 'journey/plan', label: 'Plan a journey'},
  ],
};

export default sidebars;
