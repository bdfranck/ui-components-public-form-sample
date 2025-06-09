import {
    GoabPublicForm,
    GoabPublicFormPage,
    GoabFieldset,
    GoabFormItem,
    GoabText,
    GoabInput,
    usePublicFormController,
    GoabPublicFormSummary
} from "@abgov/react-components";
import React from "react";
import {GoabFormState, requiredValidator} from "@abgov/ui-components-common";

type Page = "contact-details" | "section2a-summary";

interface Section2AProps {
    onComplete: (formState: GoabFormState) => void;
}

export const Section2A = ({ onComplete }: Section2AProps) => {
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
                editting: "contact-details",
                status: "not-started"
            });
        }, 0)
    }

    const onContinue = (e: Event, from: Page) => {
        console.log("Section2A onContinue - from:", from);
        if ((e as CustomEvent).detail?.cancelled) return;

        let nextPage: Page | undefined;

        switch (from) {
            case "contact-details":
                nextPage = validateContactDetails(e);
                break;
        }
        if (nextPage) {
            continueTo(nextPage);
        }
    }

    const validateContactDetails = (e: Event): Page|undefined => {
        const [isValid] = validate(e, "contact-details", [
            requiredValidator("Please provide your contact details.")
        ]);
        if (!isValid) return undefined;

        return "section2a-summary";
    }

    return (
        <GoabPublicForm name="section2a-contact" onComplete={onComplete} onInit={onInit}>
            <GoabPublicFormPage 
                id="contact-details" 
                heading="Your contact details" 
                buttonText="Save and continue" 
                onContinue={(e) => onContinue(e, "contact-details")}
                first
            >
                <GoabText tag="p" size="body-m" color="secondary">
                    Please provide your contact information so we can reach you about your application.
                </GoabText>
                <GoabFieldset>
                    <GoabFormItem label={"First name"}>
                        <GoabInput name="first-name"/>
                    </GoabFormItem>
                    <GoabFormItem label={"Last name"}>
                        <GoabInput name="last-name"/>
                    </GoabFormItem>
                    <GoabFormItem label={"Email address"}>
                        <GoabInput name="email" type="email" />
                    </GoabFormItem>
                    <GoabFormItem label={"Phone number"}>
                        <GoabInput name="phone" type="tel" />
                    </GoabFormItem>
                </GoabFieldset>
            </GoabPublicFormPage>

            {/* Summary page that triggers onComplete */}
            <GoabPublicFormPage 
                id="section2a-summary" 
                type="summary"
                heading="Review Your Contact Details"
                buttonText="Complete Contact Section"
            >
                <p>Please review your contact information below. Click "Complete Contact Section" to finish this section.</p>
                <GoabPublicFormSummary />
            </GoabPublicFormPage>
        </GoabPublicForm>
    );
};
