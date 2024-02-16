import React from 'react';
import * as CS from '@cloudscape-design/components';
import { Navigation } from '../components/navigation';

export function View() {
    const breadcrumbs = [
        {
            text: "Home",
            href: "#/app",
        },
        {
            text: "Error",
            href: "#/error",
        },
    ];

    const errorContent = (
        <CS.ContentLayout header={<CS.Header variant="h1">Error</CS.Header>}>
            <CS.Container>
                <CS.TextContent>Failed to route this page :(</CS.TextContent>
            </CS.Container>
        </CS.ContentLayout>
    )

    return (
        <CS.AppLayout
            breadcrumbs={
                <CS.BreadcrumbGroup items={breadcrumbs} ariaLabel="Breadcrumbs" />
            }
            navigation={<Navigation />}
            content={errorContent}
        />
    )
}