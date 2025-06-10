import React, {useState} from "react";
import {
    GoabBadge,
    GoabButton,
    GoabCallout,
    GoabCheckbox,
    GoabDatePicker,
    GoabDetails,
    GoabFieldset,
    GoabFormItem,
    GoabInput,
    GoabLink,
    GoabPublicForm,
    GoabPublicFormPage,
    GoabRadioGroup,
    GoabRadioItem,
    GoabTable,
    GoabText,
    usePublicFormController
} from "@abgov/react-components";
import {requiredValidator} from "@abgov/ui-components-common";
import {dateOfBirthValidator} from "./validator";

type Section = "form" | "tasklist" | "section2a" | "section2b" | "section2c";
type Page =
    "live-in-alberta"
    | "how-long-in-alberta"
    | "result-not-eligible"
    | "date-of-birth"
    | "current-employment"
    | "education-level"
    | "previously-applied"
    | "task-list-summary"
    | "terms-of-use"
    | "section1b-summary";

export const PublicFormPage = () => {
    const [currentSection, setCurrentSection] = useState<Section>("form");
    const [completedSections, setCompletedSections] = useState<string[]>([]);
    const [notEligibleMessage, setNotEligibleMessage] = useState("");
    
    const {
        init,
        initState,
        continueTo,
        validate,
        state,
    } = usePublicFormController<Page>("details");

    const handleNavigateToSection = (sectionId: Section) => {
        setCurrentSection(sectionId);
    };

    const onInit = (event: Event) => {
        init(event);
        setTimeout(() => {
            initState({
                uuid: crypto.randomUUID(),
                form: {},
                history: [],
                editting: "",
                status: "not-started"
            });
        }, 0)
    }

    const onComplete = () => {
        setCompletedSections(prev => ["section1a", "section1b"]);
        setCurrentSection("tasklist");
    }

    const onContinue = (e: Event, from: Page) => {
        if ((e as CustomEvent).detail?.cancelled) return;

        let nextPage: Page | undefined;

        switch (from) {
            case "live-in-alberta":
                nextPage = validateLiveInAlberta(e);
                break;
            case "how-long-in-alberta":
                nextPage = validateHowLongInAlberta(e);
                break;
            case "date-of-birth":
                nextPage = validateDateOfBirth(e);
                break;
            case "current-employment":
                nextPage = validateCurrentEmployment(e);
                break;
            case "education-level":
                nextPage = validateEducationLevel(e);
                break;
            case "previously-applied":
                nextPage = validatePreviouslyApplied(e);
                break;
            case "terms-of-use":
                nextPage = validateTermsOfUse(e);
                break;
            case "section1b-summary":
                nextPage = validateSection1BSummary(e);
                break;
        }
        if (nextPage) {
            continueTo(nextPage);
        }
    }

    const validateLiveInAlberta = (e: Event): Page|undefined => {
        const [isRequiredOk] = validate(e, "live-in-alberta", [requiredValidator("Please tell us if you currently live in Alberta.")]);
        if (!isRequiredOk) return undefined;

        const liveInAlberta = (e as CustomEvent).detail?.state?.["live-in-alberta"];
        if (liveInAlberta?.value === "No") {
            setNotEligibleMessage("If you do not live in Alberta, you are not able to access this service.");
            return "result-not-eligible";
        }
        if (liveInAlberta?.value === "Yes") return "how-long-in-alberta";

        return undefined;
    }

    const validateHowLongInAlberta = (e: Event): Page|undefined => {
        const [isRequiredOk] = validate(e, "how-long-in-alberta", [requiredValidator("Please tell us how long you have lived in Alberta.")]);
        if (!isRequiredOk) return undefined;

        const howLongInAlberta = (e as CustomEvent).detail?.state?.["how-long-in-alberta"];
        if (howLongInAlberta?.value === "less") {
            setNotEligibleMessage("You need to have lived in Alberta for greater than 1 year to use this service.");
            return "result-not-eligible";
        }
        return "date-of-birth";
    }

    const validateDateOfBirth = (e: Event): Page|undefined => {
        const [isValid] = validate(e, "date-of-birth", [
            requiredValidator("Enter a date of birth."),
            dateOfBirthValidator()
        ]);
        if (!isValid) return undefined;

        const dateOfBirth = (e as CustomEvent).detail.state["date-of-birth"];
        
        // Check if born before 2006
        const birthYear = parseInt(dateOfBirth.value.substring(0, 4), 10);
        if (birthYear > 2006) {
            setNotEligibleMessage("You need to be born before 2006 to use this service.");
            return "result-not-eligible";
        }

        return "current-employment";
    }

    const validateCurrentEmployment = (e: Event): Page|undefined => {
        const [isValid] = validate(e, "current-employment", [
            requiredValidator("Please tell us if you are currently employed.")
        ]);
        if (!isValid) return undefined;

        const currentEmployment = (e as CustomEvent).detail?.state?.["current-employment"];
        if (currentEmployment?.value === "No") {
            setNotEligibleMessage("You need to be employed to use this service.");
            return "result-not-eligible";
        }
        if (currentEmployment?.value === "Yes") return "education-level";

        return undefined;
    }

    const validateEducationLevel = (e: Event): Page|undefined => {
        const [isValid] = validate(e, "education-level", [
            requiredValidator("Please tell us what is the highest level of education you have completed.")
        ]);
        if (!isValid) return undefined;

        const educationLevel = (e as CustomEvent).detail?.state?.["education-level"];
        if (educationLevel?.value === "None") {
            setNotEligibleMessage("You need to have completed at least a high school level of education to use this service.");
            return "result-not-eligible";
        }

        return "previously-applied";
    }

    const validatePreviouslyApplied = (e: Event): Page|undefined => {
        const [isValid] = validate(e, "previously-applied", [
            requiredValidator("Please tell us if you have previously applied for or received this service.")
        ]);
        if (!isValid) return undefined;

        const previouslyApplied = (e as CustomEvent).detail?.state?.["previously-applied"];
        if (previouslyApplied?.value === "No") {
            return "task-list-summary";
        }
        if (previouslyApplied?.value === "Yes") {
            setNotEligibleMessage("You cannot use this service if you already received this service.");
            return "result-not-eligible";
        }

        return undefined;
    }

    const validateTermsOfUse = (e: Event): Page|undefined => {
        console.log("I am validating terms of use", e);
        const [isValid] = validate(e, "terms-of-use", [
            requiredValidator("You must accept the terms of use to continue.")
        ]);
        if (!isValid) return undefined;

        return "section1b-summary";
    }

    const validateSection1BSummary = (e: Event): Page|undefined => {
        // Complete the entire Section 1 flow and show task list
        onComplete();
        return undefined; // Don't navigate to another page, onComplete handles it
    }

    const handleReadTermsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        continueTo("terms-of-use");
    }

    const handleContactDetailsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setCurrentSection("section2a");
    }

    const handleFamilyClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Navigate to family section when implemented
    }

    const handleIdentityClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Navigate to identity verification section when implemented
    }

    return (
        <>
            {currentSection === "form" && (
                <GoabPublicForm name="section1-form" onComplete={onComplete} onInit={onInit}>
                    {/* Section 1A Pages */}
                    <GoabPublicFormPage
                        id="live-in-alberta"
                        heading="Do you currently live in Alberta?"
                        first={true}
                        buttonText={"Save and continue"}
                        onContinue={(e) => onContinue(e, "live-in-alberta")}
                        backUrl={window.location.origin}>
                        <GoabFieldset>
                            <GoabFormItem helpText="This service is for residents of Alberta">
                                <GoabRadioGroup name={"live-in-alberta"} id="live-in-alberta">
                                    <GoabRadioItem value="Yes" label="Yes"></GoabRadioItem>
                                    <GoabRadioItem value="No" label="No"></GoabRadioItem>
                                </GoabRadioGroup>
                            </GoabFormItem>
                        </GoabFieldset>
                    </GoabPublicFormPage>

                    <GoabPublicFormPage id="how-long-in-alberta" heading="How long have you been living in Alberta?" buttonText={"Save and continue"} onContinue={(e) => onContinue(e, "how-long-in-alberta")}>
                        <GoabFieldset>
                            <GoabFormItem>
                                <GoabRadioGroup name={"how-long-in-alberta"} id="how-long-in-alberta">
                                    <GoabRadioItem value="less" label="Less than 1 year"></GoabRadioItem>
                                    <GoabRadioItem value="greater" label="Greater than 1 year"></GoabRadioItem>
                                </GoabRadioGroup>
                            </GoabFormItem>
                        </GoabFieldset>
                    </GoabPublicFormPage>

                    <GoabPublicFormPage id="date-of-birth" heading="What is your date of birth?" buttonText={"Save and continue"} onContinue={(e) => onContinue(e, "date-of-birth")}>
                        <GoabFieldset>
                            <GoabFormItem helpText="Your date of birth is required to ensure you meet the age criteria">
                                <GoabDatePicker name="date-of-birth" type="input"/>
                            </GoabFormItem>
                        </GoabFieldset>
                    </GoabPublicFormPage>

                    <GoabPublicFormPage id="current-employment" heading="Are you currently employed?" buttonText={"Save and continue"} onContinue={(e) => onContinue(e, "current-employment")}>
                        <GoabFieldset>
                            <GoabFormItem>
                                <GoabRadioGroup name={"current-employment"} id="current-employment">
                                    <GoabRadioItem value="Yes" label="Yes"></GoabRadioItem>
                                    <GoabRadioItem value="No" label="No"></GoabRadioItem>
                                </GoabRadioGroup>
                            </GoabFormItem>
                            <GoabDetails heading="What do I do if I am self employed?">
                                <p>Here is some additional information on what to do in this case.</p>
                            </GoabDetails>
                        </GoabFieldset>
                    </GoabPublicFormPage>

                    <GoabPublicFormPage id="education-level" heading="What is the highest level of education you have completed?" buttonText={"Save and continue"} onContinue={(e) => onContinue(e, "education-level")}>
                        <GoabFieldset>
                            <GoabFormItem>
                                <GoabRadioGroup name={"education-level"} id="education-level">
                                    <GoabRadioItem value="High school" label="High school"></GoabRadioItem>
                                    <GoabRadioItem value="Post secondary" label="Post secondary"></GoabRadioItem>
                                    <GoabRadioItem value="Graduate studies" label="Graduate studies"></GoabRadioItem>
                                    <GoabRadioItem value="Other" label="Other">
                                        <div slot="reveal">
                                            {/*TODO: How to make use of public form*/}
                                            <GoabFormItem label="What is the highest level of education you have completed?">
                                                <GoabInput name="education-level-others"/>
                                            </GoabFormItem>
                                        </div>
                                    </GoabRadioItem>
                                    <GoabRadioItem value="None" label="None"></GoabRadioItem>
                                </GoabRadioGroup>
                            </GoabFormItem>
                        </GoabFieldset>
                    </GoabPublicFormPage>

                    <GoabPublicFormPage id="previously-applied" heading="Have you previously applied for or received this service?" buttonText={"Save and continue"} onContinue={(e) => onContinue(e, "previously-applied")}>
                        <GoabFieldset>
                            <GoabFormItem>
                                <GoabRadioGroup name={"previously-applied"} id="previously-applied">
                                    <GoabRadioItem value="Yes" label="Yes"></GoabRadioItem>
                                    <GoabRadioItem value="No" label="No"></GoabRadioItem>
                                </GoabRadioGroup>
                            </GoabFormItem>
                        </GoabFieldset>
                    </GoabPublicFormPage>

                    <GoabPublicFormPage id="result-not-eligible" heading="You are not eligible for this service">
                        <GoabCallout type="important" heading={"This service is only for Alberta residents"}>
                            {notEligibleMessage}
                        </GoabCallout>

                        <GoabText tag={"p"}>You can now close this window.</GoabText>

                        <GoabText tag={"h3"} size={"heading-m"}>If you have questions about your application</GoabText>
                        <GoabText tag={"p"}>Contact the [ministry area].</GoabText>
                        <GoabText tag={"p"}>Email: <GoabLink><a href={"mailto:information@gov.ab.ca"}>information@gov.ab.ca</a></GoabLink></GoabText>

                        <GoabText tag={"p"}>Phone: <GoabLink><a href={"780-123-4567"}>780-123-4567</a>{" "}</GoabLink></GoabText>

                        <GoabButton type={"tertiary"}>Back to Alberta.ca</GoabButton>
                    </GoabPublicFormPage>

                    <GoabPublicFormPage id="task-list-summary" type="multistep" heading="Apply for a service (Demo)">
                        <div className="warning">
                            <GoabCallout type="information" size="medium" heading="You have 3 sections to complete" mb="2xl" mt="xl">
                                <GoabLink><a href="#" onClick={handleReadTermsClick}>Start terms of use</a></GoabLink>
                            </GoabCallout>
                        </div>
                        <GoabText tag="h2">
                            1. Before you start
                        </GoabText>
                        <GoabTable width="100%" mb="2xl" mt="l">
                            <tbody>
                            <tr>
                                <td>
                                    <GoabText tag="span" size={"body-m"}>Eligibility questions</GoabText>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabBadge type="success" content="Completed" ariaLabel="completed"></GoabBadge>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <GoabLink><a href="#" onClick={handleReadTermsClick}>Read terms of use</a></GoabLink>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabBadge type="information" content="Not started" ariaLabel="not started" />
                                </td>
                            </tr>
                            </tbody>
                        </GoabTable>
                        <GoabText tag="h2">
                            2. Prepare application
                        </GoabText>
                        <GoabText tag="p" size="body-s" color="secondary">
                            You need to complete the previous section before you can start this task.
                        </GoabText>
                        <GoabTable width="100%" mb="2xl" mt="l">
                            <tbody>
                            <tr>
                                <td>
                                    <GoabText tag="span" size={"body-m"}>Your contact details</GoabText>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <GoabText tag={"span"} size={"body-m"}>
                                        Your family
                                    </GoabText>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <GoabText tag={"span"} size={"body-m"}>
                                        Verify your identity
                                    </GoabText>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                                </td>
                            </tr>
                            </tbody>
                        </GoabTable>

                        <GoabText tag="h2">
                            3. Schedule service
                        </GoabText>
                        <GoabText tag="p" size="body-s" color="secondary">
                            You need to complete the previous section before you can start this task.
                        </GoabText>
                        <GoabTable width="100%" mt="l" mb="3xl">
                            <tbody>
                            <tr>
                                <td> <GoabText tag={"span"} size={"body-m"}>
                                    Receive email confirmation</GoabText>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                                </td>
                            </tr>
                            <tr>
                                <td> <GoabText tag={"span"} size={"body-m"}>
                                    Choose date</GoabText>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                                </td>
                            </tr>
                            <tr>
                                <td><GoabText tag={"span"} size={"body-m"}>
                                    Pay service fee</GoabText>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                                </td>
                            </tr>
                            </tbody>
                        </GoabTable>
                    </GoabPublicFormPage>

                    {/* Section 1B Pages */}
                    <GoabPublicFormPage 
                        id="terms-of-use" 
                        heading="Terms of use" 
                        buttonText="Continue to next section" 
                        onContinue={(e) => onContinue(e, "terms-of-use")}
                    >
                        <GoabText tag="p" size="body-m" color="secondary">
                            Donec malesuada sagittis fringilla pulvinar in molestie. Sagittis felis congue pellentesque tristique urna in habitasse. At faucibus commodo pellentesque enim nisl at. Fermentum quisque viverra diam amet consequat tellus. Amet interdum sit elementum nibh at justo.
                        </GoabText>
                        <GoabFieldset>
                            <GoabFormItem>
                                <GoabCheckbox name="terms-of-use" text="I accept the terms of use." />
                            </GoabFormItem>
                        </GoabFieldset>
                    </GoabPublicFormPage>

                    <GoabPublicFormPage 
                        id="section1b-summary" 
                        type="multistep"
                        heading="Apply for a service (Demo)"
                    >
                        <div className="warning">
                            <GoabCallout type="information" size="medium" heading="Application incomplete" mb="2xl" mt="xl">
                                You have completed 1 of 3 sections.
                            </GoabCallout>
                        </div>
                        <GoabText tag="h2">
                            1. Before you start
                        </GoabText>
                        <GoabTable width="100%" mb="2xl" mt="l">
                            <tbody>
                            <tr>
                                <td>
                                    <GoabText tag="span" size={"body-m"}>Eligibility questions</GoabText>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabBadge type="success" content="Completed" ariaLabel="completed"></GoabBadge>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <GoabText tag="span" size={"body-m"}>Read terms of use</GoabText>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabBadge type="success" content="Completed" ariaLabel="completed"></GoabBadge>
                                </td>
                            </tr>
                            </tbody>
                        </GoabTable>
                        <GoabText tag="h2">
                            2. Prepare application
                        </GoabText>
                        <GoabTable width="100%" mb="2xl" mt="l">
                            <tbody>
                            <tr>
                                <td>
                                    <GoabLink><a href="#" onClick={handleContactDetailsClick}>Your contact details</a></GoabLink>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabText tag="span" size="body-m" color="secondary"> Not started</GoabText>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <GoabLink><a href="#" onClick={handleFamilyClick}>Your family</a></GoabLink>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabText tag="span" size="body-m" color="secondary"> Not started</GoabText>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <GoabLink><a href="#" onClick={handleIdentityClick}>Verify your identity</a></GoabLink>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabText tag="span" size="body-m" color="secondary"> Not started</GoabText>
                                </td>
                            </tr>
                            </tbody>
                        </GoabTable>

                        <GoabText tag="h2">
                            3. Schedule service
                        </GoabText>
                        <GoabText tag="p" size="body-s" color="secondary">
                            You need to complete the previous section before you can start this task.
                        </GoabText>
                        <GoabTable width="100%" mt="l" mb="3xl">
                            <tbody>
                            <tr>
                                <td> <GoabText tag={"span"} size={"body-m"}>
                                    Receive email confirmation</GoabText>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                                </td>
                            </tr>
                            <tr>
                                <td> <GoabText tag={"span"} size={"body-m"}>
                                    Choose date</GoabText>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                                </td>
                            </tr>
                            <tr>
                                <td><GoabText tag={"span"} size={"body-m"}>
                                    Pay service fee</GoabText>
                                </td>
                                <td className="goa-table-number-column">
                                    <GoabText tag="span" size="body-m" color="secondary"> Cannot start yet</GoabText>
                                </td>
                            </tr>
                            </tbody>
                        </GoabTable>
                    </GoabPublicFormPage>
                </GoabPublicForm>
            )}
        </>
    );
};
