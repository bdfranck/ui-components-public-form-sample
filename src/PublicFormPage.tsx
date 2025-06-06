import {
    requiredValidator,
    GoabFormState,
} from "@abgov/ui-components-common";
import {
    GoabDatePicker,
    GoabPublicForm,
    GoabPublicFormPage,
    GoabFieldset,
    GoabFormItem,
    GoabRadioGroup,
    GoabRadioItem,
    GoabInput,
    usePublicFormController, GoabDetails
} from "@abgov/react-components";
import React, {useState} from "react";
import {dateOfBirthValidator} from "./validator";

type Page =
    "live-in-alberta"
    | "how-long-in-alberta"
    | "result-not-eligible"
    | "date-of-birth"
    | "current-employment"
    | "education-level"
    | "previously-applied"
    | "result-eligible"
    | "task-list";

export const PublicFormPage = () => {
    const {
        state,
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

    const onComplete = (event: GoabFormState) => {
        console.log("onComplete is clicked with event", event);
    }

    const onContinue = (e: Event, from: Page) => {
        console.log("onContinue is clicked with e ", e, "from ", from);
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
        if (previouslyApplied?.value === "No") return "result-eligible";

        return undefined;
    }

    return (
        <>
            <GoabPublicForm name="public-form-demo" onComplete={onComplete} onInit={onInit}>
                <GoabPublicFormPage
                    id="live-in-alberta"
                    heading="Do you currently live in Alberta?"
                    first
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

                <GoabPublicFormPage id="how-long-in-alberta" heading="How long have you been living in Alberta?" onContinue={(e) => onContinue(e, "how-long-in-alberta")}>
                    <GoabFieldset>
                        <GoabFormItem>
                            <GoabRadioGroup name={"how-long-in-alberta"} id="how-long-in-alberta">
                                <GoabRadioItem value="less" label="Less than 1 year"></GoabRadioItem>
                                <GoabRadioItem value="greater" label="Greater than 1 year"></GoabRadioItem>
                            </GoabRadioGroup>
                        </GoabFormItem>
                    </GoabFieldset>
                </GoabPublicFormPage>

                <GoabPublicFormPage id="date-of-birth" heading="What is your date of birth?" onContinue={(e) => onContinue(e, "date-of-birth")}>
                    <GoabFieldset>
                        <GoabFormItem>
                            <GoabDatePicker name="date-of-birth" type="input"/>
                        </GoabFormItem>
                    </GoabFieldset>
                </GoabPublicFormPage>

                <GoabPublicFormPage id="current-employment" heading="Are you currently employed?" onContinue={(e) => onContinue(e, "current-employment")}>
                    <GoabFieldset>
                        <GoabFormItem>
                            <GoabRadioGroup name={"current-employment"} id="current-employment">
                                <GoabRadioItem value="Yes" label="Yes" reveal={
                                    <GoabDetails heading="What do I do if I am self employed?">
                                        <p>Here is some additional information on what to do in this case.</p>
                                    </GoabDetails>
                                }></GoabRadioItem>
                                <GoabRadioItem value="No" label="No"></GoabRadioItem>
                            </GoabRadioGroup>
                        </GoabFormItem>
                    </GoabFieldset>
                </GoabPublicFormPage>

                <GoabPublicFormPage id="education-level" heading="What is the highest level of education you have completed?" onContinue={(e) => onContinue(e, "education-level")}>
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

                <GoabPublicFormPage id="previously-applied" heading="Have you previously applied for or received this service?" onContinue={(e) => onContinue(e, "previously-applied")}>
                    <GoabFieldset>
                        <GoabFormItem>
                            <GoabRadioGroup name={"previously-applied"} id="previously-applied">
                                <GoabRadioItem value="Yes" label="Yes"></GoabRadioItem>
                                <GoabRadioItem value="No" label="No"></GoabRadioItem>
                            </GoabRadioGroup>
                        </GoabFormItem>
                    </GoabFieldset>
                </GoabPublicFormPage>

                <GoabPublicFormPage id="result-not-eligible" heading="">
                    <p>{notEligibleMessage}</p>
                </GoabPublicFormPage>

                <GoabPublicFormPage id="result-eligible" heading="">
                    <p>You are eligible to use this service.</p>
                </GoabPublicFormPage>
            </GoabPublicForm>
        </>
    )
}
