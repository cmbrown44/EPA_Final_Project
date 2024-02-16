import * as React from "react";
import * as CS from '@cloudscape-design/components';
import * as Localisation from "../../../localisation";

export function View() {

    const identity: CS.TopNavigationProps.Identity = {
        href: "#",
        title: "Interview Question Library",
        logo: {
            src: "/icons8-library-50.png",
            alt: "Qwiz: Interview Question Library Icon"
        }
    };

    return (
        <>
            <div id="top-nav">
                <CS.TopNavigation
                    identity={identity}
                    i18nStrings={Localisation.CSTopNavigation}
                />
            </div>
        </>
    )
}