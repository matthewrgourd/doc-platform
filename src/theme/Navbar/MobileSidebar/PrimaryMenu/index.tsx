import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';

type MenuSection = {
  heading: string;
  items: Array<{label: string; to: string}>;
};

const sections: MenuSection[] = [
  {
    heading: 'Petstore',
    items: [
      {label: 'Getting started', to: '/petstore/getting-started'},
      {label: 'Pets', to: '/petstore/pets'},
      {label: 'Store', to: '/petstore/store'},
      {label: 'Users', to: '/petstore/users'},
      {label: 'API reference', to: '/petstore/api-reference'},
    ],
  },
  {
    heading: 'TfL',
    items: [
      {label: 'Getting started', to: '/tfl/getting-started'},
      {label: 'Lines', to: '/tfl/lines'},
      {label: 'StopPoints', to: '/tfl/stoppoints'},
      {label: 'Journey', to: '/tfl/journey'},
      {label: 'API reference', to: '/tfl/api-reference'},
    ],
  },
];

export default function NavbarMobilePrimaryMenu(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();

  return (
    <ul className="menu__list">
      {sections.map((section) => (
        <li className="menu__list-item" key={section.heading}>
          <span className="menu__link menu__link--sublist menu__link--active">
            {section.heading}
          </span>
          <ul className="menu__list">
            {section.items.map((item) => (
              <li className="menu__list-item" key={item.to}>
                <Link className="menu__link" to={item.to} onClick={() => mobileSidebar.toggle()}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
