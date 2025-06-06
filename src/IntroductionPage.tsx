import {GoabText, GoabButton} from "@abgov/react-components";
import {Link, useNavigate} from "react-router-dom";
import "./IntroductionPage.css";

export const IntroductionPage = () => {
    const navigate = useNavigate();

    return (
        <div className="introduction-page">
            <GoabText mt={"2xl"} mb={"none"} size="heading-xl" tag="h1">Name of service</GoabText>

            <GoabText tag="p" size={"body-l"} mt={"l"}>
                A short overview of the service. This is a couple sentences that helps
                the user understand what the service is.
            </GoabText>

            <GoabText tag="p" size={"body-m"}>
                Use this service to apply for [service]. You can use this service to:
                <ul className="goa-unordered-list">
                    <li>
                        <GoabText tag="span">See of you or a family member is eligible for [service]</GoabText>
                    </li>
                    <li>
                        <GoabText tag="span">Create and submit an application for [service]</GoabText>
                    </li>
                    <li>
                        <GoabText tag="span">Continue an application for [service] that you already started</GoabText>
                    </li>
                </ul>
            </GoabText>

            <GoabText tag="h2" size={"heading-l"} mt={"2xl"} mb={"none"}>Before you begin</GoabText>

            <GoabText tag="p">
                The application form should take about 20 minutes to complete.
            </GoabText>

            <GoabText tag="p" size={"heading-xs"}>
                In order to complete the application you will need:
                <ul className="goa-unordered-list">
                    <li>
                        <GoabText tag="span">government issued ID for the person applying</GoabText>
                    </li>
                </ul>
            </GoabText>


            <GoabButton type="start" mt={"2xl"} onClick={() => {
                navigate('/public-form');
            }}>
                Apply for [service]
            </GoabButton>


            <GoabText size="heading-l" tag="h2" mt={"3xl"}>Other information about the service</GoabText>

            <GoabText tag="p" size={"body-m"}>
                This section contains supplementary details about the service, including
                descriptions of less common scenarios, exceptions, and additional resources
                available. It provides context and additional insights that may be relevant to your
                specific circumstances or interests, helping you understand the full scope and
                utility of the service offered.
            </GoabText>

            <GoabText size="heading-l" tag="h2" mt={"2xl"}>Support</GoabText>

            <GoabText tag="p" mb={"3xl"}>
                For assistance, email us at <a href="mailto:help@gov.ab.ca">help@gov.ab.ca</a>
            </GoabText>
        </div>
    );
}
