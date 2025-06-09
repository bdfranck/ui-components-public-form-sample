import {
    GoabPublicForm,
    GoabPublicFormPage,
    GoabFieldset,
    GoabFormItem,
    GoabText,
    GoabCheckbox,
    usePublicFormController,
    GoabPublicFormSummary
} from "@abgov/react-components";
import React from "react";
import {GoabFormState, requiredValidator} from "@abgov/ui-components-common";

type Page = "terms-of-use" | "section1b-summary";

interface Section1BProps {
    onComplete: (formState: GoabFormState) => void;
}

export const Section1B = ({ onComplete }: Section1BProps) => {
    const {
        init,
        initState,
        continueTo,
        validate,
    } = usePublicFormController<Page>("details");

    const onInit = (event: Event) => {
        init(event);
        setTimeout(() => {
            initState({
                uuid: crypto.randomUUID(),
                form: {},
                history: [],
                editting: "terms-of-use",
                status: "not-started"
            });
        }, 0)
    }

    const onContinue = (e: Event, from: Page) => {
        console.log("Section1B onContinue - from:", from);
        if ((e as CustomEvent).detail?.cancelled) return;

        let nextPage: Page | undefined;

        switch (from) {
            case "terms-of-use":
                nextPage = validateTermsOfUse(e);
                break;
        }
        if (nextPage) {
            continueTo(nextPage);
        }
    }

    const validateTermsOfUse = (e: Event): Page|undefined => {
        const [isValid] = validate(e, "terms-of-use", [
            requiredValidator("You must accept the terms of use to continue.")
        ]);
        if (!isValid) return undefined;

        return "section1b-summary";
    }

    return (
        <GoabPublicForm name="section1b-terms" onComplete={onComplete} onInit={onInit}>
            <GoabPublicFormPage 
                id="terms-of-use" 
                heading="Terms of use" 
                buttonText="Continue to next section" 
                onContinue={(e) => onContinue(e, "terms-of-use")}
                first
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

            {/* Summary page that triggers onComplete */}
            <GoabPublicFormPage 
                id="section1b-summary" 
                type="summary"
                heading="Review Your Terms Acceptance"
                buttonText="Complete Terms Section"
            >
                <p>Please review your acceptance below. Click "Complete Terms Section" to finish this section.</p>
                <GoabPublicFormSummary />
            </GoabPublicFormPage>
        </GoabPublicForm>
    );
};
