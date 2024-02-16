import React from 'react';
import * as CS from '@cloudscape-design/components';
import { Navigation } from '../components/navigation';
import Body from '../components/upload/body';

export function View() {
    const breadcrumbs = [
        {
            text: "Home",
            href: "#/main",
        },
        {
            text: "Upload",
            href: "#/uploadForm",
        },
    ];

    const localContent = (
        <CS.ContentLayout header={<CS.Header variant="h1">Upload</CS.Header>}>
            <CS.Container>
                <Body />
            </CS.Container>
        </CS.ContentLayout>
    )

    return (
        <CS.AppLayout
            breadcrumbs={
                <CS.BreadcrumbGroup items={breadcrumbs} ariaLabel="Breadcrumbs" />
            }
            navigation={<Navigation />}
            content={localContent}
        />
    )
}