// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as ReactRouter from "react-router-dom";
import * as Error from "./views/error";
import * as App from "./views/app";
import * as Header from "./views/header";
import * as Upload from "./views/uploadForm";

import '@cloudscape-design/global-styles/index.css';

function element(view: React.ReactNode) {
  return (
    <React.Fragment>
      < Header.View />
      {view}
    </React.Fragment>
  );
}

const router = ReactRouter.createHashRouter([
  {
    path: "",
    element: element(<App.View />),
    errorElement: element(<Error.View />),
  },
  {
    path: "Main",
    element: element(<App.View />),
    errorElement: element(<Error.View />),
  },
  {
    path: "Upload",
    element: element(<Upload.View />),
    errorElement: element(<Error.View />),
  }
])


const root = document.getElementById("root");
if (root != undefined) {
  ReactDOM.createRoot(root).render(
    <ReactRouter.RouterProvider
      router={router}
      future={{ v7_startTransition: true }}
    />,
  );
} else {
  console.error("could not get document root");
}