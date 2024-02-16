// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import * as CS from '@cloudscape-design/components';


export function Navigation() {
  const [navigationItems, setNavigationItems] = React.useState<
    CS.SideNavigationProps.Item[]
  >([
    {
      type: 'link',
      text: 'Home',
      href: '#/main'
    },
    {
      type: 'link',
      text: 'Upload',
      href: '#/upload'
    },
  ]);



  return (
    <>
      <CS.SideNavigation
        items={navigationItems}
      />
    </>);
}
