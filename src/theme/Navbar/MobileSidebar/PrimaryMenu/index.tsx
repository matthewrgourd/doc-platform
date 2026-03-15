import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import type {Props as NavbarItemConfig} from '@theme/NavbarItem';

function useNavbarItems() {
  return useThemeConfig().navbar.items as NavbarItemConfig[];
}

type MobileLinkItem = {
  label: string;
  to?: string;
  href?: string;
};

function toMobileLinkItem(item: NavbarItemConfig): MobileLinkItem | null {
  if (!('label' in item) || typeof item.label !== 'string') {
    return null;
  }

  if ('to' in item && typeof item.to === 'string') {
    return {label: item.label, to: item.to};
  }

  if ('href' in item && typeof item.href === 'string') {
    return {label: item.label, href: item.href};
  }

  if ('items' in item && Array.isArray(item.items)) {
    const firstLinkChild = item.items.find(
      (child) =>
        ('to' in child && typeof child.to === 'string') ||
        ('href' in child && typeof child.href === 'string'),
    );

    if (firstLinkChild) {
      if ('to' in firstLinkChild && typeof firstLinkChild.to === 'string') {
        return {label: item.label, to: firstLinkChild.to};
      }
      if ('href' in firstLinkChild && typeof firstLinkChild.href === 'string') {
        return {label: item.label, href: firstLinkChild.href};
      }
    }
  }

  return null;
}

export default function NavbarMobilePrimaryMenu(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useNavbarItems().map(toMobileLinkItem).filter(Boolean) as MobileLinkItem[];

  return (
    <ul className="menu__list">
      {items.map((item, i) => (
        <li className="menu__list-item" key={i}>
          <Link
            className="menu__link"
            to={item.to}
            href={item.href}
            onClick={() => mobileSidebar.toggle()}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
