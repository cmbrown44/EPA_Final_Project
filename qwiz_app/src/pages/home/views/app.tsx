// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import * as CS from '@cloudscape-design/components';
import * as Localistaion from "../../../localisation";
import { Logo } from "../components/logo";
import { Navigation } from '../components/navigation';
import { QuestionTable } from "../components/questionTable";

import '../styles.css';

export function View() {

  const breadcrumbs = [
    {
      text: "Home",
      href: "#/index",
    }
  ];

  const localContent = (
    <CS.ContentLayout header={<CS.Header variant="h1">Qwiz: The Interview Question Library</CS.Header>} >
      <CS.SpaceBetween direction="vertical" size="xs">
        <CS.Container>
          <Logo></Logo>
        </CS.Container>
        <CS.Container>
          <QuestionTable />
        </CS.Container>
      </CS.SpaceBetween>
    </CS.ContentLayout>

  );

  return (
    <CS.AppLayout
      headerSelector="#top-nav"
      ariaLabels={{
        navigation: 'Navigation drawer',
        navigationClose: 'Close navigation drawer',
        navigationToggle: 'Open navigation drawer',
        notifications: 'Notifications',
        tools: 'Help panel',
        toolsClose: 'Close help panel',
        toolsToggle: 'Open help panel',
      }}
      content={localContent}
      breadcrumbs={
        <CS.BreadcrumbGroup items={breadcrumbs} ariaLabel="Breadcrumbs" />
      }
      navigation={<Navigation />}
    />
  );
}

