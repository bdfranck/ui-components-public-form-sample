import React, {StrictMode} from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "@abgov/web-components";
import App from './App';
import './App.css';
import {PublicFormPage} from "./PublicFormPage";
import {IntroductionPage} from "./IntroductionPage";

// Explicitly expose React to the window object to ensure libraries use the same instance
// @ts-ignore
window.React = React;
// @ts-ignore
window.ReactDOM = ReactDOM;

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index element={<IntroductionPage />} />
                    <Route path={"/public-form"} element={<PublicFormPage/>}></Route>
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>,
);
