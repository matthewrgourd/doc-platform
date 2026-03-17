import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import {useLocation} from '@docusaurus/router';

type MenuSection = {
  heading: string;
  groups: Array<{
    label: string;
    items: Array<{label: string; to: string}>;
  }>;
  apiPlaygroundPath: string;
};

const sections: MenuSection[] = [
  {
    heading: 'TfL',
    groups: [
      {
        label: 'Getting started',
        items: [
          {label: 'Overview', to: '/tfl/getting-started'},
          {label: 'Quickstart', to: '/tfl/getting-started/quickstart'},
          {label: 'Authentication', to: '/tfl/getting-started/authentication'},
          {label: 'Error handling', to: '/tfl/getting-started/error-handling'},
        ],
      },
      {
        label: 'Lines',
        items: [
          {label: 'Overview', to: '/tfl/lines'},
          {label: 'Line status', to: '/tfl/lines/status'},
          {label: 'Line routes', to: '/tfl/lines/routes'},
        ],
      },
      {
        label: 'Stop points',
        items: [
          {label: 'Overview', to: '/tfl/stoppoints'},
          {label: 'Search stops', to: '/tfl/stoppoints/search'},
          {label: 'Arrivals', to: '/tfl/stoppoints/arrivals'},
        ],
      },
      {
        label: 'Journey',
        items: [
          {label: 'Overview', to: '/tfl/journey'},
          {label: 'Plan a journey', to: '/tfl/journey/plan'},
        ],
      },
    ],
    apiPlaygroundPath: '/tfl/api-playground',
  },
  {
    heading: 'Petstore',
    groups: [
      {
        label: 'Getting started',
        items: [
          {label: 'Overview', to: '/petstore/getting-started'},
          {label: 'Quickstart', to: '/petstore/getting-started/quickstart'},
          {label: 'Authentication', to: '/petstore/getting-started/authentication'},
          {label: 'Error handling', to: '/petstore/getting-started/error-handling'},
        ],
      },
      {
        label: 'Pets',
        items: [
          {label: 'Overview', to: '/petstore/pets'},
          {label: 'Add a pet', to: '/petstore/pets/add-pet'},
          {label: 'Find pets', to: '/petstore/pets/find-pets'},
          {label: 'Update a pet', to: '/petstore/pets/update-pet'},
          {label: 'Delete a pet', to: '/petstore/pets/delete-pet'},
          {label: 'Upload an image', to: '/petstore/pets/upload-image'},
        ],
      },
      {
        label: 'Store',
        items: [
          {label: 'Overview', to: '/petstore/store'},
          {label: 'Place an order', to: '/petstore/store/place-order'},
          {label: 'Get order by ID', to: '/petstore/store/get-order'},
          {label: 'Cancel an order', to: '/petstore/store/cancel-order'},
          {label: 'Inventory', to: '/petstore/store/inventory'},
        ],
      },
      {
        label: 'Users',
        items: [
          {label: 'Overview', to: '/petstore/users'},
          {label: 'Create a user', to: '/petstore/users/create-user'},
          {label: 'Login and logout', to: '/petstore/users/login'},
          {label: 'Manage users', to: '/petstore/users/manage-user'},
        ],
      },
    ],
    apiPlaygroundPath: '/petstore/api-playground',
  },
];

export default function NavbarMobilePrimaryMenu(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const location = useLocation();
  const pathname = location.pathname.replace(/\/$/, '');
  const downloadSpecHref =
    pathname === '/petstore/api-playground'
      ? '/openapi/petstore-playground.json'
      : pathname === '/tfl/api-playground'
        ? '/openapi/tfl-playground.json'
        : null;

  return (
    <ul className="menu__list">
      {sections.map((section) => (
        <li className="menu__list-item menu__list-item--show" key={section.heading}>
          <span className="menu__link">
            {section.heading}
          </span>
          <ul className="menu__list" style={{height: 'auto', overflow: 'visible'}}>
            {section.groups.map((group) => (
              <li className="menu__list-item menu__list-item--show" key={`${section.heading}-${group.label}`}>
                <span className="menu__link">{group.label}</span>
                <ul className="menu__list" style={{height: 'auto', overflow: 'visible'}}>
                  {group.items.map((item) => (
                    <li className="menu__list-item" key={item.to}>
                      <Link className="menu__link" to={item.to} onClick={() => mobileSidebar.toggle()}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            <li className="menu__list-item">
              <Link className="menu__link" to={section.apiPlaygroundPath} onClick={() => mobileSidebar.toggle()}>
                API playground
              </Link>
            </li>
          </ul>
        </li>
      ))}
      {downloadSpecHref && (
        <li className="menu__list-item">
          <a
            className="menu__link"
            href={downloadSpecHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => mobileSidebar.toggle()}>
            Download API spec
          </a>
        </li>
      )}
    </ul>
  );
}
