import {
    GoabButton,
    GoabCallout,
    GoabDatePicker,
    GoabDetails,
    GoabFieldset,
    GoabFormItem,
    GoabLink,
    GoabPublicForm,
    GoabPublicFormPage,
    GoabRadioGroup,
    GoabRadioItem,
    GoabText,
    usePublicFormController,
    GoabPublicFormSummary
} from "@abgov/react-components";
import React, {useState} from "react";
import {GoabFormState, requiredValidator} from "@abgov/ui-components-common";
import {dateOfBirthValidator} from "./validator";

type Page =
    "live-in-alberta"
    | "how-long-in-alberta"
    | "result-not-eligible"
    | "date-of-birth"
    | "current-employment"
    | "education-level"
    | "previously-applied"
    | "section1a-summary";

interface Section1AProps {
    onComplete: (formState: GoabFormState) => void;
}

export const Section1A = ({ onComplete }: Section1AProps) => {
    const {
        init,
        initState,
        continueTo,
        validate,
    } = usePublicFormController<Page>("details");
    const [notEligibleMessage, setNotEligibleMessage] = useState("");
    const onInit = (event: Event) => {
        init(event);
        setTimeout(() => {
            initState({
                uuid: crypto.randomUUID(),
                form: {},
                history: [],
                editting: "live-in-alberta",
                status: "not-started"
            });
        }, 0)
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
        console.log("e", dateOfBirth);

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
        if (previouslyApplied?.value === "Yes") {
            setNotEligibleMessage("You cannot use this service if you already received this service.");
            return "result-not-eligible";
        }
        if (previouslyApplied?.value === "No") return "section1a-summary";

        return undefined;
    }
    return (
        <>
            <GoabPublicForm name="section1a-screener" onComplete={onComplete} onInit={onInit}>
                <GoabPublicFormPage
                    id="live-in-alberta"
                    heading="Do you currently live in Alberta?"
                    first
                    buttonText={"Save and continue"}
                    onContinue={(e) => onContinue(e, "live-in-alberta")}>
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
                                <GoabRadioItem value="Other" label="Other"></GoabRadioItem>
                                <GoabRadioItem value="None" label="None"></GoabRadioItem>
                            </GoabRadioGroup>
                        </GoabFormItem>
                    </GoabFieldset>
                </GoabPublicFormPage>

                <GoabPublicFormPage id="previously-applied" type="summary" heading="Have you previously applied for or received this service?" buttonText={"Save and continue"}>
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
            </GoabPublicForm>
        </>
    )
}
